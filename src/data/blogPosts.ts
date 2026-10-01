export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  body: string[];
}

/* ✏️ Naya post add karna ho to bas array mein ek object jod do. Card aur article page apne aap ban jayega. */
export const blogPosts: BlogPost[] = [
  {
    slug: "my-cybersecurity-journey",
    category: "Journey",
    title: "My Cybersecurity Journey",
    excerpt:
      "From BCA fundamentals to Kali Linux, Nmap and web security: how I am building my career in cybersecurity, one step at a time.",
    date: "29 Sep 2026",
    body: [
      "Cybersecurity is an area that I have been genuinely interested in and want to build my career in. As a BCA Computer System student, I started exploring cybersecurity to understand how websites, applications, networks, and systems can be protected from real-world security threats.",
      "My learning journey started with the fundamentals of computer networks, operating systems, and web technologies. I have been learning concepts such as the OSI model, TCP/IP, DNS, DHCP, network devices, ports, and how communication happens between systems. Understanding these basics has helped me build a stronger foundation for cybersecurity.",
      "I have also started working with tools and environments commonly used for security learning, including Kali Linux, VirtualBox, Termux, Wireshark, and Nmap. Through these tools, I am learning how security professionals analyze systems, understand network traffic, identify services, and investigate potential vulnerabilities in controlled environments.",
      "Another major area of my learning is web application security. I am interested in understanding how websites and applications can be secured against common vulnerabilities. I am learning about authentication, authorization, secure login systems, input validation, APIs, databases, and other security concepts while building my own web projects.",
      "Programming is also an important part of my cybersecurity journey. I am focusing particularly on Python, because I want to use programming for automation, security tools, scripting, and security analysis. I am also improving my understanding of HTML, CSS, JavaScript, SQL, and other technologies that are useful for understanding how modern web applications work.",
      "One of my long-term goals is to build a cybersecurity company that helps businesses secure their websites and applications. I want to eventually work in areas such as vulnerability assessment, penetration testing, web security, security testing, and security awareness.",
      "I know cybersecurity is not something that can be mastered quickly. It requires continuous learning, practical experimentation, patience, and a strong understanding of fundamentals. My current goal is not simply to learn tools, but to understand why vulnerabilities exist, how they can be detected, and most importantly, how they can be prevented and fixed.",
      "I am documenting my cybersecurity journey through articles, projects, experiments, and lessons I learn along the way. Hopefully, this blog will not only help me track my own progress but also help other beginners who are starting their journey into cybersecurity.",
      "This is just the beginning.",
    ],
  },
  {
    slug: "top-5-cyber-threats-2026",
    category: "Threats",
    title: "Top 5 Cyber Threats in 2026",
    excerpt: "From AI-powered phishing to zero-day exploits — here is what to watch out for this year.",
    date: "29 Sep 2026",
    body: [
      "Attackers keep using the same few doors, but they get better at disguising them. These are five threats worth understanding this year.",
      "1. AI-assisted phishing. Scam messages are now well written, personal and hard to spot by spelling mistakes alone. Always check the sender and the link, not just the wording.",
      "2. Ransomware. Malware that locks your files and demands payment. Offline backups and installing updates quickly are the best protection.",
      "3. Stolen and reused passwords. When one site leaks your password, attackers try it everywhere else. Use a different password for every account and turn on two-factor authentication.",
      "4. Supply-chain attacks. Instead of attacking you directly, attackers compromise software or services you already trust. Keep your apps updated and install only from official sources.",
      "5. Unpatched vulnerabilities and zero-days. Flaws that are known but not fixed on your devices are the easiest way in. Turn on automatic updates wherever you can.",
    ],
  },
  {
    slug: "check-if-your-email-was-breached",
    category: "Privacy",
    title: "How to Check if Your Email Was Breached",
    excerpt: "A step-by-step guide to finding out if your credentials are exposed on the dark web.",
    date: "29 Sep 2026",
    body: [
      "Data breaches happen to big and small services alike. The good news is that checking whether your email was exposed takes a minute.",
      "Step 1: Search your email on a trusted breach-checking service such as Have I Been Pwned, or use the breach checker inside AxelleVault. Never enter your password on a random website that offers to check it.",
      "Step 2: If your email appears in a breach, note which service it came from and what data leaked.",
      "Step 3: Change the password on that service right away, and on any other account where you used the same password.",
      "Step 4: Turn on two-factor authentication for your important accounts, starting with email and banking.",
      "Step 5: Use a password manager so every account gets a unique, strong password. Stay alert for phishing messages, because leaked emails are often used to target people.",
    ],
  },
  {
    slug: "what-is-phishing",
    category: "Phishing",
    title: "What is Phishing and How to Avoid It",
    excerpt: "Real examples of phishing attacks and the simple habits that keep you protected.",
    date: "29 Sep 2026",
    body: [
      "Phishing is when an attacker pretends to be someone you trust, such as a bank, a delivery company or your employer, to trick you into sharing passwords, OTPs or payment details.",
      "Common examples: an SMS saying your parcel is on hold with a link to pay a small fee, an email claiming your account will be closed unless you log in now, or a fake login page that looks exactly like the real one.",
      "Red flags: urgent or threatening language, unexpected attachments, a sender address that is slightly off, and links whose real address does not match the company.",
      "Habits that protect you: never share an OTP with anyone, open websites by typing the address yourself instead of tapping links, and check suspicious links with the phishing scanner before opening them.",
      "If you already clicked or entered details, change the password immediately, contact your bank if money is involved, and turn on two-factor authentication.",
    ],
  },
];

export const readMinutes = (post: BlogPost) =>
  Math.max(1, Math.ceil(post.body.join(" ").split(/\s+/).length / 200));