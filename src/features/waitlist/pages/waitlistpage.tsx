import { useState } from "react";
import type { FormEvent } from "react";

type WaitlistEntry = {
  fullName: string;
  email: string;
  date: string;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function WaitlistPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = fullName.trim();
    const mail = email.trim();

    if (name.length < 2) {
      setMessage({ text: "Please enter your full name.", error: true });
      return;
    }

    if (!isValidEmail(mail)) {
      setMessage({ text: "Please enter a valid email address.", error: true });
      return;
    }

    const waitlist: WaitlistEntry[] = JSON.parse(localStorage.getItem("waitlist") || "[]");
    if (waitlist.some((entry) => entry.email.toLowerCase() === mail.toLowerCase())) {
      setMessage({ text: "This email is already on the waitlist.", error: true });
      return;
    }

    setLoading(true);

    // Replace this with a real request to the backend when it is ready:
    // await fetch("YOUR_API_URL", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ fullName: name, email: mail }),
    // });
    waitlist.push({ fullName: name, email: mail, date: new Date().toISOString() });
    localStorage.setItem("waitlist", JSON.stringify(waitlist));

    setTimeout(() => {
      setMessage({ text: "You're on the list. We'll be in touch!", error: false });
      setFullName("");
      setEmail("");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      {/* Logo */}
      <img
        src="/images/logo.png"
        alt="Homelander logo"
        className="absolute left-3 top-3 w-[90px] sm:left-5 sm:top-[50px] sm:w-[140px]"
      />

     <main className="mx-auto max-w-[440px] px-6 pb-10 pt-24 text-center sm:mt-[85px] sm:pt-20">        {/* Icons */}
        <div className="mb-6 flex justify-center gap-[30px] sm:mb-[30px]">
          <img
            src="/images/icons.png"
            alt="Home, scan and chat icons"
            className="h-[54px] w-[200px] rounded-[19px]"
          />
        </div>

        {/* Heading */}
       <h1 className="mb-6 whitespace-nowrap text-[22px] leading-[1.2] font-bold sm:text-[34px]">
          Your Next <span className="text-[#1b3d36]">Real Estate</span>
          <span className="block font-['Playfair_Display',serif] text-[22px] sm:text-[30px]">
            Move Starts Here.
          </span>
        </h1>

        {/* Paragraph */}
        <p className="mb-10 text-sm leading-[1.6] text-[#444] sm:text-base">
          Get early access to houses, land and agents, plus investment opportunities, verified
          news and market insights.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-[340px] flex-col gap-4 rounded-3xl bg-[#F5F3ED] p-6"
        >
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-[#e2e0da] bg-white p-4 text-base outline-none focus:border-[green]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#e2e0da] bg-white p-4 text-base outline-none focus:border-[green]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-black p-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Joining..." : "join the waitlist"}
          </button>

          {message && (
            <p className={`text-[13px] ${message.error ? "text-[#c0392b]" : "text-[#1b3d36]"}`}>
              {message.text}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
