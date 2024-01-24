import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        username: string,
        admin: boolean
    }
    interface Session {
       user: User & {
        username: string
       }
       token: {
        username: string
       }
    }
}