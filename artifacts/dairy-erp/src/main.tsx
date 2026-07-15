import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initStaffSession } from "@/lib/auth/staffServiceSession";

// Sign the Supabase client into the staff service account before rendering
// so all queries run as `authenticated` and RLS policies work as designed.
initStaffSession().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
