export function generateUniqueUser() {
    
    const suffix = Math.random().toString(36).substring(2, 8);

    return {
        username: `user${suffix}`,
        email: `user${suffix}@app.com`,
        password: `user${suffix}pwd`,
    }
};

export const REGISTER_MESSAGES = {
    MISSING_REQUIRED_FIELDS: "Missing required fields",
    USER_ALREADY_EXISTS: "User already exists",
    REGISTRATION_FAILED: "Registration failed",
} as const;

export const backendErrorCases = {
    
    emptyCredentials: {
        username: "",
        email: "",
        password: "",
        expectedMessage: REGISTER_MESSAGES.MISSING_REQUIRED_FIELDS,
        description: "with empty credentials"
    },
    emptyUsername: {
        username: "",
        email: "user1@app.com",
        password: "user1pwd",
        expectedMessage: REGISTER_MESSAGES.MISSING_REQUIRED_FIELDS,
        description: "with empty username"
    },
    emptyEmail: {
        username: "user1",
        email: "",
        password: "user1pwd",
        expectedMessage: REGISTER_MESSAGES.MISSING_REQUIRED_FIELDS,
        description: "with empty email"
    },
    emptyPassword: {
        username: "user1",
        email: "user1@app.com",
        password: "",
        expectedMessage: REGISTER_MESSAGES.MISSING_REQUIRED_FIELDS,
        description: "with empty password"
    },
    existingUser: {
        username: "user1",
        email: "user1@app.com",
        password: "user1pwd",
        expectedMessage: REGISTER_MESSAGES.USER_ALREADY_EXISTS,
        description: "with an existing user"
    },
    existingUsername: {
        username: "user1",
        email: generateUniqueUser().email,
        password: "user1pwd",
        expectedMessage: REGISTER_MESSAGES.USER_ALREADY_EXISTS,
        description: "with an existing username"
    },
    existingEmail: {
        username: generateUniqueUser().username,
        email: "user1@app.com",
        password: "user1pwd",
        expectedMessage: REGISTER_MESSAGES.USER_ALREADY_EXISTS,
        description: "with an existing email"
    },
};

export const formErrorCases = {
    
    invalidEmail: {
        username: "user1",
        email: "not-an-email",
        password: "user1pwd",
        field: 'email',
        description: "with an invalid email format"
    },
    usernameWithSpaces: {
        username: "user 1",
        email: "user1@app.com",
        password: "user1pwd",
        field: 'username',
        description: "with an username with spaces"
    },
    emailWithSpaces: {
        username: "user1",
        email: "user 1@app.com",
        password: "user1pwd",
        field: 'email',
        description: "with an email with spaces"
    },
} as const;