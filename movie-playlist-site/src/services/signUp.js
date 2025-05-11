import { supabase } from './supabaseClient';
import CryptoJS from 'crypto-js';

export async function signUpWithEmail({ email, password, fullName, username, birthDate }) {
  try {
    console.log("Starting signup process for:", email);
    
    // 1. First generate a salt and hash the password for our custom user table
    const salt = CryptoJS.lib.WordArray.random(16).toString();
    const passwordHash = CryptoJS.SHA512(password + salt).toString();
    const saltedPasswordHash = `${salt}:${passwordHash}`;

    // 2. Sign up the user with Supabase Auth
    console.log("Signing up with Supabase Auth...");
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirmed-page`,
        data: {
          full_name: fullName,
          username,
          date_of_birth: birthDate,
          // Store this flag to identify unconfirmed users
          email_confirmed: false,
          // Store the password hash securely in metadata for later use
          temp_password_hash: saltedPasswordHash
        },
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      if (signUpError.status === 400 && signUpError.message.includes("registered")) {
        return { error: "Email already in use. Please log in instead." };
      }
      return { error: signUpError.message };
    }
    
    const user = authData?.user;
    if (!user) {
      console.error("No user object returned from signup");
      return { error: 'Signup failed: No user object returned.' };
    }
    
    console.log("User created in auth:", user.id);
    
    // Store the salted hash in localStorage temporarily (will be cleared after confirmation)
    localStorage.setItem(`tempHash_${user.id}`, saltedPasswordHash);
    console.log("Stored temporary hash in localStorage");
    
    // 3. Return success message - we'll create the user record on confirmation
    return { 
      success: true, 
      message: "Please check your email to confirm your account. Your profile will be created after confirmation.",
      userId: user.id  // We'll need this for the confirmation page
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: error.message };
  }
}

// Ensure this function is correctly implementing the user creation
export async function createUserAfterConfirmation(userId) {
  try {
    console.log("Starting user creation process for ID:", userId);
    
    // 1. Get the user's metadata from auth
    console.log("Step 1: Fetching user metadata from auth...");
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError) {
      console.error("Error fetching user from auth:", getUserError);
      throw new Error(getUserError?.message || "User not found");
    }
    
    if (!user) {
      console.error("No user object returned from auth");
      throw new Error("User not found in auth");
    }
    
    console.log("Auth user data:", {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    });
    
    // 2. Check if this user has already been added to the user table
    console.log("Step 2: Checking if user exists in database...");
    const { data: existingUser, error: checkError } = await supabase
      .from('user')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log("User not found in database (expected for new users)");
      } else {
        console.error("Database check error:", checkError);
        throw new Error(`Database check error: ${checkError.message}`);
      }
    }
      
    if (existingUser) {
      console.log("User already exists in database:", existingUser);
      return { success: true, message: "User already exists in database" };
    }

    // 3. Get the stored password hash
    console.log("Step 3: Retrieving password hash from localStorage...");
    const tempHash = localStorage.getItem(`tempHash_${userId}`);
    if (!tempHash) {
      console.warn("No temporary hash found in localStorage");
    } else {
      console.log("Found temporary hash in localStorage");
    }
    
    // Clear the localStorage entry for security
    localStorage.removeItem(`tempHash_${userId}`);
    
    // 4. Extract user metadata from the auth user
    console.log("Step 4: Extracting user metadata...");
    const metadata = user.user_metadata || {};
    console.log("User metadata for insertion:", {
      full_name: metadata.full_name,
      username: metadata.username,
      email: user.email,
      date_of_birth: metadata.date_of_birth,
      gender: metadata.gender,
      phone: metadata.phone
    });
    
    // If metadata is missing, try to get it from the auth user's raw data
    if (!metadata.full_name || !metadata.username) {
      console.log("Metadata missing, checking auth user data...");
      const { data: authUser, error: authError } = await supabase
        .from('auth.users')
        .select('raw_user_meta_data')
        .ilike('id', userId)
        .limit(1);

      if (authError) {
        console.error("Error fetching auth user data:", authError);
        throw new Error("Could not retrieve user data from auth");
      }

      if (authUser?.raw_user_meta_data) {
        Object.assign(metadata, authUser.raw_user_meta_data);
        console.log("Retrieved metadata from auth user:", metadata);
      }
    }

    if (!metadata.full_name || !metadata.username) {
      console.error("Missing required metadata:", {
        hasFullName: !!metadata.full_name,
        hasUsername: !!metadata.username
      });
      throw new Error("Required user metadata is missing");
    }
    
    // 5. Insert the confirmed user into your custom user table
    console.log("Step 5: Inserting user into database...");
    const userData = {
      id: userId,
      full_name: metadata.full_name,
      username: metadata.username,
      email: user.email,
      password_hash: tempHash || metadata.temp_password_hash || "NEEDS_RESET",
      date_of_birth: metadata.date_of_birth,
      gender: metadata.gender,
      phone: metadata.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log("Attempting to insert user data:", userData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('user')
      .insert(userData)
      .select();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      console.error("Failed user data:", userData);
      throw new Error(`Failed to create user profile: ${insertError.message}`);
    }
    
    console.log("User successfully created:", insertData);
    
    // 6. Update the user's metadata to mark them as confirmed
    console.log("Step 6: Updating user metadata to mark as confirmed...");
    const { error: updateError } = await supabase.auth.updateUser({
      data: { email_confirmed: true }
    });

    if (updateError) {
      console.warn("Warning: Could not update user metadata:", updateError);
    } else {
      console.log("Successfully updated user metadata");
    }
    
    console.log("User creation process completed successfully");
    return { success: true, data: insertData };
  } catch (error) {
    console.error("Error creating user after confirmation:", error);
    console.error("Error stack:", error.stack);
    return { error: error.message };
  }
}