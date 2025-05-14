import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

let socketInstance = null;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    if (!socketInstance) {
      console.log("🔌 Connecting socket...");
      socketInstance = io("http://localhost:5000", {
        withCredentials: true,
      });

      socketInstance.on("connect", () => {
        console.log("🟢 Socket connected:", socketInstance.id);
      });

      socketInstance.on("disconnect", () => {
        console.log("🔴 Socket disconnected");
      });

      set({ socket: socketInstance });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
      console.log("✅ Authenticated user:", res.data);
    } catch (error) {
      console.error("❌ Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("✅ Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error("❌ Signup error:", error);
      const response = error?.response;
      if (response?.data?.message) {
        toast.error(response.data.message);
      } else if (response?.status === 400 && Array.isArray(response.data?.errors)) {
        response.data.errors.forEach(err => toast.error(err.message));
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("✅ Logged in successfully");
      get().connectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      console.log("✅ Logout response:", res.data);
      set({ authUser: null });
      toast.success("✅ Logout successful");

      if (get().socket) {
        get().socket.disconnect();
        set({ socket: null });
        socketInstance = null;
      }
    } catch (error) {
      console.error("❌ Error in logout:", error);
      toast.error("Logout failed. Please try again.");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("✅ Profile updated successfully");
    } catch (error) {
      console.error("❌ Error in updateProfile:", error);
      const message = error?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
