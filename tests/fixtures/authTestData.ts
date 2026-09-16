export const validUser = {
    username: "user1",
    email: "user1@app.com",
    password: "user1pwd"
};

export const errorCases = [
    {
        identifier: "",
        password: "",
        description: "with empty credentials"
    },
    {
        identifier: "nonexistentuser",
        password: "nonexistentuserpwd",
        description: "with non existing user using username"
    },
    {
        identifier: "nonexistentuser@app.com",
        password: "nonexistentuserpwd",
        description: "with non existing user using email"
    },
    {
        identifier: "user1",
        password: "invalidpassword",
        description: "with invalid password using username"
    },
    {
        identifier: "user1@app.com",
        password: "invalidpassword",
        description: "with invalid password using email"
    },
    {
        identifier: "",
        password: "user1pwd",
        description: "with empty identifier"
    },
    {
        identifier: "user1",
        password: "",
        description: "with empty password using username"
    },
    {
        identifier: "user1@app.com",
        password: "",
        description: "with empty password using email"
    },
    {
        identifier: "USER1",
        password: "invalidpassword",
        description: "with uppercase identifier using username"
    },
    {
        identifier: "USER1@app.com",
        password: "user1pwd",
        description: "with uppercase identifier using email"
    },

];

export const AUTH_MESSAGES = {
    
    INVALID_CREDENTIALS: "Invalid credentials",
} as const;