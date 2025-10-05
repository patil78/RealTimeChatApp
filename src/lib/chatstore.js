

import { create } from "zustand";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create((set, get) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  // Set current chat and user
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // Set chatId and user first
    set({ chatId, user });

    // Set initial blocked states based on current user and other user
    const isCurrentUserBlocked = user.blocked?.includes(currentUser.id) || false;
    const isReceiverBlocked = currentUser.blocked?.includes(user.id) || false;

    set({ isCurrentUserBlocked, isReceiverBlocked });

    // Start listening to current user's blocked array in Firestore
    const userRef = doc(db, "users", currentUser.id);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const blocked = docSnap.data().blocked || [];
      set({
        isReceiverBlocked: blocked.includes(user.id),
      });
    });

    // Return unsubscribe so component can clean up
    return unsubscribe;
  },

  // Toggle block status locally
  changeBlock: () => {
    set((state) => ({ isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
