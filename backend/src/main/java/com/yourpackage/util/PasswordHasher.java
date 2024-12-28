package com.yourpackage.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordHasher {

    // Hash the password
    public static String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt());
    }

    // Verify the password
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }

    public static void main(String[] args) {
        String plainPassword = "mySecurePassword";

        // Hash the password
        String hashedPassword = hashPassword(plainPassword);
        System.out.println("Hashed Password: " + hashedPassword);

        // Verify the password
        boolean isMatch = verifyPassword(plainPassword, hashedPassword);
        System.out.println("Password Match: " + isMatch);
    }
}
