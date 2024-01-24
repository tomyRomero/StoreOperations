import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/mongoose";
import User from "./models/user.model";
import { compare } from "bcrypt";
import GithubProvider from "next-auth/providers/github";




export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: 'jwt'
    },
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID ?? "",
        clientSecret: process.env.GITHUB_SECRET ?? "",
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text", placeholder: "jsmith@gmail.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          connectToDB();  

          if(!credentials?.email || !credentials?.password)
          {
            return null;
          }

          const existingUser = await User.findOne({ email: credentials?.email });

          if(!existingUser)
          {
            return null;
          }

          const passwordMatch = await compare(credentials.password , existingUser.password)

          if(!passwordMatch) {
            return null;
          }


          return {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            admin: existingUser.admin
          }

        }
      })
    ], 
    callbacks: {
      async jwt({ token, user }) {
        if(user) {
          return {
            ...token,
            username: user.username,
            id: user.id,
            admin: user.admin
          }
        }
        return token
      },
      async session({ session, token}) {
        return {
          ...session,
          user: {
            ...session.user,
            username: token.username,
            id: token.id,
            admin: token.admin
          }
        }
      }
    }
}