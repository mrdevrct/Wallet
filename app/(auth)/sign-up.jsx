import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/auth.styles.js";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useState } from "react";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Basic input validation
    if (!emailAddress || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display verification form
      setPendingVerification(true);
      setError(""); // Clear any previous errors
    } catch (err) {
      // Handle specific Clerk errors
      const errorMessage =
        err.errors?.[0]?.message || "An error occurred during sign-up.";
      setError(errorMessage);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    // Basic input validation
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // Handle incomplete verification
        setError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      // Handle specific Clerk errors
      const errorMessage =
        err.errors?.[0]?.message || "Invalid verification code.";
      setError(errorMessage);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      {pendingVerification ? (
        <View style={styles.verificationContainer}>
          <Text style={styles.verificationTitle}>Verify your email</Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError("")}>
                <Ionicons name="close" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            value={code}
            style={[styles.verificationInput, error && styles.errorInput]}
            placeholder="Enter your verification code"
            placeholderTextColor="#9A8478"
            onChangeText={(code) => {
              setCode(code);
              setError(""); // Clear error on input change
            }}
          />
          <TouchableOpacity onPress={onVerifyPress} style={styles.verifyButton}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <Image
            source={require("../../assets/images/revenue-i2.png")}
            style={styles.illustration}
          />
          <Text style={styles.title}>Create Account</Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError("")}>
                <Ionicons name="close" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            style={[styles.input, error && styles.errorInput]}
            placeholder="Enter email"
            placeholderTextColor="#9A8478"
            onChangeText={(email) => setEmailAddress(email)}
          />

          <TextInput
            value={password}
            style={[styles.input, error && styles.errorInput]}
            placeholder="Enter password"
            placeholderTextColor="#9A8478"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
          <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
