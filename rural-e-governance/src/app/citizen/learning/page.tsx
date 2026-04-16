// // "use client";

// // import { useState, useRef, useEffect } from "react";

// // interface Video {
// //   id: number;
// //   title: string;
// //   description: string;
// //   duration: string;
// //   category: string;
// //   categoryColor: string;
// //   icon: string;
// //   instructor: string;
// //   views: string;
// //   rating: number;
// //   offlineAvailable: boolean;
// //   progress: number;
// // }

// // interface DocItem {
// //   name: string;
// //   type: string;
// //   size: string;
// //   icon: string;
// //   downloads: string;
// //   category: string;
// // }

// // interface ChatMessage {
// //   role: "user" | "bot";
// //   text: string;
// // }

// // const VIDEOS: Video[] = [
// //   { id: 1, title: "Basic Digital Literacy", description: "Learn smartphones, apps & internet for daily use", duration: "15:30", category: "Digital", categoryColor: "#3B82F6", icon: "📱", instructor: "Ramesh Kumar", views: "12.4K", rating: 4.8, offlineAvailable: true, progress: 60 },
// //   { id: 2, title: "Organic Farming Techniques", description: "Modern organic methods for better yield & soil health", duration: "22:45", category: "Agriculture", categoryColor: "#16A34A", icon: "🌾", instructor: "Dr. Priya Singh", views: "28.1K", rating: 4.9, offlineAvailable: true, progress: 0 },
// //   { id: 3, title: "Financial Literacy Basics", description: "Banking, loans, investments & government schemes", duration: "18:20", category: "Finance", categoryColor: "#D97706", icon: "💰", instructor: "Sunil Mehta", views: "9.7K", rating: 4.6, offlineAvailable: false, progress: 30 },
// //   { id: 4, title: "Health & Hygiene Practices", description: "Basic healthcare for rural families & communities", duration: "12:15", category: "Health", categoryColor: "#DC2626", icon: "🏥", instructor: "Dr. Anita Rao", views: "15.3K", rating: 4.7, offlineAvailable: true, progress: 100 },
// //   { id: 5, title: "Water Conservation", description: "Rainwater harvesting & smart irrigation systems", duration: "20:10", category: "Agriculture", categoryColor: "#16A34A", icon: "💧", instructor: "Vikram Patil", views: "8.2K", rating: 4.5, offlineAvailable: true, progress: 0 },
// //   { id: 6, title: "Government Schemes Guide", description: "PM-Kisan, MNREGA, Ayushman Bharat & more", duration: "25:00", category: "Welfare", categoryColor: "#7C3AED", icon: "🏛️", instructor: "IAS Kavita Sharma", views: "31.8K", rating: 4.9, offlineAvailable: true, progress: 0 },
// // ];

// // const DOCUMENTS: DocItem[] = [
// //   { name: "MNREGA Guidelines", type: "PDF", size: "2.4 MB", icon: "📄", downloads: "45K", category: "Welfare" },
// //   { name: "PM-Kisan Application Form", type: "PDF", size: "1.1 MB", icon: "📋", downloads: "82K", category: "Agriculture" },
// //   { name: "Soil Health Card Guide", type: "PDF", size: "3.2 MB", icon: "🗺️", downloads: "19K", category: "Agriculture" },
// //   { name: "Ayushman Bharat Benefits", type: "PDF", size: "1.8 MB", icon: "💊", downloads: "67K", category: "Health" },
// //   { name: "Kisan Credit Card Info", type: "PDF", size: "0.9 MB", icon: "💳", downloads: "23K", category: "Finance" },
// //   { name: "Digital Payment Guide", type: "PDF", size: "1.5 MB", icon: "📲", downloads: "34K", category: "Digital" },
// // ];

// // const QUICK_QUESTIONS: string[] = [
// //   "How do I apply for PM-Kisan?",
// //   "What crops are best for Rabi season?",
// //   "How to use UPI for payments?",
// //   "What is MNREGA job card?",
// // ];

// // const BOT_RESPONSES: Record<string, string> = {
// //   "How do I apply for PM-Kisan?": "To apply for **PM-Kisan Samman Nidhi**: \n\n1. Visit your nearest **Common Service Centre (CSC)**\n2. Carry your **Aadhaar card**, **bank passbook** & **land records**\n3. The officer will register you on the portal\n4. You can also apply at **pmkisan.gov.in**\n\nOnce approved, **₹2,000** is directly transferred to your bank every 4 months. 🌾",
// //   "What crops are best for Rabi season?": "**Best Rabi crops** (Oct–March):\n\n🌾 **Wheat** – Most popular, good returns\n🟡 **Mustard** – Low water, high profit\n🫘 **Chickpea (Chana)** – Good market price\n🧅 **Potato & Onion** – High demand\n🥕 **Vegetables** – Quick harvest cycle\n\nRabi season needs **less water**. Use drip irrigation for best results!",
// //   "How to use UPI for payments?": "**UPI Payment Steps:**\n\n1. Download **BHIM** or any UPI app\n2. Link your **bank account**\n3. Set a **4-digit UPI PIN**\n4. To pay: Enter phone number or scan **QR code**\n5. Enter amount → Confirm with PIN\n\n✅ Free to use\n✅ Works 24/7\n✅ Instant transfer\n\nStart with small amounts to practice! 📱",
// //   "What is MNREGA job card?": "**MNREGA (Job Card)** gives you the **right to work 100 days/year** guaranteed by government!\n\n📌 **How to get it:**\n- Apply at your **Gram Panchayat**\n- Bring Aadhaar + photo + residence proof\n- Card issued within **15 days**\n\n💰 **Payment:** ₹200–350/day directly to bank\n🏗️ **Work:** Roads, ponds, soil conservation\n\nIt's your **legal right** as a rural worker! 🇮🇳",
// // };

// // export default function LearningPage() {
// //   const [activeTab, setActiveTab] = useState<string>("videos");
// //   const [selectedCategory, setSelectedCategory] = useState<string>("All");
// //   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
// //     { role: "bot", text: "नमस्ते! 🙏 I'm your AI Learning Assistant. Ask me anything about farming, government schemes, health, or digital skills!\n\n*Type in Hindi or English — I understand both!*" },
// //   ]);
// //   const [inputText, setInputText] = useState<string>("");
// //   const [isTyping, setIsTyping] = useState<boolean>(false);
// //   const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
// //   const [searchQuery, setSearchQuery] = useState<string>("");
// //   const chatEndRef = useRef<HTMLDivElement>(null);
// //   const [downloadedDocs, setDownloadedDocs] = useState<string[]>([]);
// //   const [language, setLanguage] = useState<string>("EN");

// //   useEffect(() => {
// //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [chatMessages, isTyping]);

// //   const categories: string[] = ["All", "Agriculture", "Digital", "Finance", "Health", "Welfare"];

// //   const filteredVideos = VIDEOS.filter((v) => {
// //     const matchCat = selectedCategory === "All" || v.category === selectedCategory;
// //     const matchSearch =
// //       v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       v.description.toLowerCase().includes(searchQuery.toLowerCase());
// //     return matchCat && matchSearch;
// //   });

// //   const sendMessage = async (text?: string): Promise<void> => {
// //     const userMsg = text ?? inputText.trim();
// //     if (!userMsg) return;
// //     setInputText("");
// //     setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
// //     setIsTyping(true);
// //     await new Promise((r) => setTimeout(r, 1200));
// //     const response =
// //       BOT_RESPONSES[userMsg] ??
// //       `That's a great question! I'm searching our knowledge base about **"${userMsg}"**...\n\nFor detailed information, please watch our related video lessons or download the relevant PDFs from the Documents section. You can also visit your nearest **Common Service Centre (CSC)** for in-person help. 🙏`;
// //     setIsTyping(false);
// //     setChatMessages((prev) => [...prev, { role: "bot", text: response }]);
// //   };

// //   const handleDownload = (docName: string): void => {
// //     setDownloadedDocs((prev) => [...prev, docName]);
// //     setTimeout(() => setDownloadedDocs((prev) => prev.filter((d) => d !== docName)), 3000);
// //   };

// //   const formatBotText = (text: string) => {
// //     return text.split("\n").map((line, i) => {
// //       const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
// //       const italic = bold.replace(/\*(.*?)\*/g, "<em>$1</em>");
// //       return <p key={i} dangerouslySetInnerHTML={{ __html: italic }} style={{ margin: "2px 0", lineHeight: 1.6 }} />;
// //     });
// //   };

// //   return (
// //     <div style={{ fontFamily: "'Noto Sans', sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #fefce8 50%, #f0f9ff 100%)" }}>
// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Baloo+2:wght@600;700;800&display=swap');
// //         * { box-sizing: border-box; }
// //         ::-webkit-scrollbar { width: 6px; }
// //         ::-webkit-scrollbar-track { background: #f1f5f9; }
// //         ::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 3px; }
// //         .video-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; }
// //         .video-card { transition: all 0.3s ease; }
// //         .doc-row:hover { background: #f0fdf4 !important; }
// //         .doc-row { transition: background 0.2s; }
// //         .tab-btn { transition: all 0.2s; }
// //         .cat-btn { transition: all 0.2s; }
// //         .send-btn:hover { transform: scale(1.05); }
// //         .quick-q:hover { background: #16a34a !important; color: white !important; transform: translateY(-2px); }
// //         .quick-q { transition: all 0.2s; }
// //         @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
// //         .dot { display: inline-block; width: 8px; height: 8px; background: #16a34a; border-radius: 50%; margin: 0 2px; animation: typing 1.2s infinite; }
// //         .dot:nth-child(2) { animation-delay: 0.2s; }
// //         .dot:nth-child(3) { animation-delay: 0.4s; }
// //         .lang-toggle { transition: all 0.2s; }
// //         .lang-toggle:hover { opacity: 0.8; }
// //         @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
// //         .msg-bubble { animation: fadeIn 0.3s ease; }
// //         .progress-bar { background: linear-gradient(90deg, #16a34a, #4ade80); border-radius: 4px; height: 6px; }
// //       `}</style>

// //       {/* Main Content */}
// //       <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

// //         {/* Left Panel */}
// //         <div>
// //           <div style={{ marginBottom: 24 }}>+
// //             <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 32, fontWeight: 800, color: "#14532d", margin: 0, lineHeight: 1.1 }}>
// //               Learning Portal 
// //             </h1>
// //             <p style={{ color: "#4b5563", fontSize: 15, margin: "6px 0 0", fontWeight: 500 }}>
// //               Video lessons, PDFs & AI Tutor — Learn at your own pace, in your language
// //             </p>
// //           </div>

// //           {/* Search */}
// //           <div style={{ position: "relative", marginBottom: 20 }}>
// //             <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, zIndex: 1 }}>🔍</span>
// //             <input
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               placeholder="Search videos, topics, government schemes..."
// //               style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 14, border: "2px solid #d1fae5", background: "white", fontSize: 14, outline: "none", color: "#111827", fontFamily: "inherit" }}
// //               onFocus={(e) => (e.target.style.border = "2px solid #16a34a")}
// //               onBlur={(e) => (e.target.style.border = "2px solid #d1fae5")}
// //             />
// //           </div>

// //           {/* Tabs */}
// //           <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "white", padding: 6, borderRadius: 14, border: "1px solid #e5e7eb", width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
// //             {["videos", "documents"].map((tab) => (
// //               <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", background: activeTab === tab ? "linear-gradient(135deg, #15803d, #16a34a)" : "transparent", color: activeTab === tab ? "white" : "#4b5563", boxShadow: activeTab === tab ? "0 4px 12px rgba(21,128,61,0.3)" : "none" }}>
// //                 {tab === "videos" ? "🎬 Video Lessons" : "📄 Documents"}
// //               </button>
// //             ))}
// //           </div>

// //           {activeTab === "videos" && (
// //             <>
// //               {/* Category Filter */}
// //               <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
// //                 {categories.map((cat) => (
// //                   <button key={cat} className="cat-btn" onClick={() => setSelectedCategory(cat)} style={{ padding: "7px 18px", borderRadius: 20, border: `2px solid ${selectedCategory === cat ? "#15803d" : "#e5e7eb"}`, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", background: selectedCategory === cat ? "#15803d" : "white", color: selectedCategory === cat ? "white" : "#374151" }}>
// //                     {cat}
// //                   </button>
// //                 ))}
// //               </div>

// //               {/* Video Grid */}
// //               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
// //                 {filteredVideos.map((video) => (
// //                   <div key={video.id} className="video-card" style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", cursor: "pointer", border: "1px solid #f0fdf4" }} onClick={() => setSelectedVideo(video)}>
// //                     <div style={{ background: `linear-gradient(135deg, ${video.categoryColor}22, ${video.categoryColor}44)`, height: 140, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderBottom: `3px solid ${video.categoryColor}30` }}>
// //                       <span style={{ fontSize: 52 }}>{video.icon}</span>
// //                       <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "3px 8px", color: "white", fontSize: 11, fontWeight: 700 }}>
// //                         ⏱ {video.duration}
// //                       </div>
// //                       {video.offlineAvailable && (
// //                         <div style={{ position: "absolute", top: 10, left: 10, background: "#15803d", borderRadius: 6, padding: "3px 8px", color: "white", fontSize: 10, fontWeight: 700 }}>
// //                           📥 OFFLINE
// //                         </div>
// //                       )}
// //                       <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.95)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
// //                         ▶
// //                       </div>
// //                     </div>
// //                     <div style={{ padding: "14px 16px 16px" }}>
// //                       <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
// //                         <span style={{ background: `${video.categoryColor}20`, color: video.categoryColor, padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{video.category}</span>
// //                         <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>★ {video.rating}</span>
// //                         <span style={{ color: "#9ca3af", fontSize: 11 }}>• {video.views} views</span>
// //                       </div>
// //                       <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{video.title}</h3>
// //                       <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>{video.description}</p>
// //                       <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>👨‍🏫 {video.instructor}</div>
// //                       {video.progress > 0 ? (
// //                         <div>
// //                           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
// //                             <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{video.progress === 100 ? "✅ Completed" : "In Progress"}</span>
// //                             <span style={{ fontSize: 11, color: "#15803d", fontWeight: 700 }}>{video.progress}%</span>
// //                           </div>
// //                           <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6 }}>
// //                             <div className="progress-bar" style={{ width: `${video.progress}%` }} />
// //                           </div>
// //                         </div>
// //                       ) : (
// //                         <button style={{ width: "100%", padding: "9px", background: "linear-gradient(135deg, #15803d, #16a34a)", border: "none", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
// //                           ▶ Start Learning
// //                         </button>
// //                       )}
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </>
// //           )}

// //           {activeTab === "documents" && (
// //             <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", overflow: "hidden", border: "1px solid #f0fdf4" }}>
// //               <div style={{ padding: "18px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// //                 <div>
// //                   <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#14532d" }}>📋 Downloadable Resources</h2>
// //                   <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Official government forms, guides & informational PDFs</p>
// //                 </div>
// //                 <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "6px 14px" }}>
// //                   <span style={{ fontSize: 13, color: "#15803d", fontWeight: 700 }}>{DOCUMENTS.length} documents</span>
// //                 </div>
// //               </div>
// //               {DOCUMENTS.map((doc, i) => (
// //                 <div key={i} className="doc-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i < DOCUMENTS.length - 1 ? "1px solid #f9fafb" : "none" }}>
// //                   <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
// //                     <div style={{ width: 46, height: 46, background: "#fef9c3", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
// //                       {doc.icon}
// //                     </div>
// //                     <div>
// //                       <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{doc.name}</div>
// //                       <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
// //                         <span style={{ background: "#f3f4f6", padding: "1px 7px", borderRadius: 4, marginRight: 6 }}>{doc.type}</span>
// //                         {doc.size} • 📥 {doc.downloads} downloads
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
// //                     <span style={{ fontSize: 11, background: "#f0fdf4", color: "#15803d", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{doc.category}</span>
// //                     <button onClick={() => handleDownload(doc.name)} style={{ padding: "9px 18px", background: downloadedDocs.includes(doc.name) ? "#dcfce7" : "linear-gradient(135deg, #15803d, #16a34a)", border: "none", borderRadius: 10, color: downloadedDocs.includes(doc.name) ? "#15803d" : "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", minWidth: 100 }}>
// //                       {downloadedDocs.includes(doc.name) ? "✅ Saved!" : "⬇ Download"}
// //                     </button>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>

// //         {/* Right Panel — AI Tutor */}
// //         <div style={{ position: "sticky", top: 20 }}>
// //           <div style={{ background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(21,128,61,0.12)", overflow: "hidden", border: "2px solid #d1fae5" }}>
// //             {/* Chat Header */}
// //             <div style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "18px 20px" }}>
// //               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
// //                 <div style={{ width: 46, height: 46, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤖</div>
// //                 <div>
// //                   <div style={{ color: "white", fontWeight: 800, fontSize: 16, fontFamily: "'Baloo 2', cursive" }}>AI Tutor Assistant</div>
// //                   <div style={{ color: "#a7f3d0", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
// //                     <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} />
// //                     Online — Hindi & English
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Messages */}
// //             <div style={{ height: 340, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12, background: "#fafafa" }}>
// //               {chatMessages.map((msg, i) => (
// //                 <div key={i} className="msg-bubble" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
// //                   {msg.role === "bot" && (
// //                     <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #15803d, #16a34a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>🌱</div>
// //                   )}
// //                   <div style={{ maxWidth: "80%", padding: "12px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "linear-gradient(135deg, #15803d, #16a34a)" : "white", color: msg.role === "user" ? "white" : "#111827", fontSize: 13, lineHeight: 1.5, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: msg.role === "bot" ? "1px solid #e5e7eb" : "none" }}>
// //                     {formatBotText(msg.text)}
// //                   </div>
// //                 </div>
// //               ))}
// //               {isTyping && (
// //                 <div className="msg-bubble" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
// //                   <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #15803d, #16a34a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌱</div>
// //                   <div style={{ padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: "white", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
// //                     <span className="dot" /><span className="dot" /><span className="dot" />
// //                   </div>
// //                 </div>
// //               )}
// //               <div ref={chatEndRef} />
// //             </div>

// //             {/* Quick Questions */}
// //             <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", background: "white" }}>
// //               <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Questions</div>
// //               <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
// //                 {QUICK_QUESTIONS.map((q, i) => (
// //                   <button key={i} className="quick-q" onClick={() => sendMessage(q)} style={{ fontSize: 11, padding: "5px 11px", borderRadius: 20, border: "1.5px solid #d1fae5", background: "#f0fdf4", color: "#15803d", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
// //                     {q}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Input */}
// //             <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", background: "white", display: "flex", gap: 8 }}>
// //               <input
// //                 value={inputText}
// //                 onChange={(e) => setInputText(e.target.value)}
// //                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
// //                 placeholder="Ask in Hindi or English..."
// //                 style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "2px solid #d1fae5", fontSize: 13, outline: "none", fontFamily: "inherit", color: "#111827" }}
// //                 onFocus={(e) => (e.target.style.border = "2px solid #15803d")}
// //                 onBlur={(e) => (e.target.style.border = "2px solid #d1fae5")}
// //               />
// //               <button className="send-btn" onClick={() => sendMessage()} style={{ width: 44, height: 44, background: "linear-gradient(135deg, #15803d, #16a34a)", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(21,128,61,0.3)" }}>
// //                 🚀
// //               </button>
// //             </div>
// //           </div>

// //           {/* Progress Card */}
// //           <div style={{ marginTop: 16, background: "white", borderRadius: 18, padding: "18px", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", border: "1px solid #f0fdf4" }}>
// //             <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#14532d" }}>📊 Your Learning Progress</h3>
// //             {[
// //               { label: "Digital Literacy", pct: 60, color: "#3B82F6" },
// //               { label: "Agriculture", pct: 35, color: "#16A34A" },
// //               { label: "Government Schemes", pct: 80, color: "#7C3AED" },
// //               { label: "Financial Skills", pct: 20, color: "#D97706" },
// //             ].map((item, i) => (
// //               <div key={i} style={{ marginBottom: 12 }}>
// //                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
// //                   <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{item.label}</span>
// //                   <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.pct}%</span>
// //                 </div>
// //                 <div style={{ background: "#f3f4f6", borderRadius: 4, height: 8 }}>
// //                   <div style={{ width: `${item.pct}%`, height: "100%", background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`, borderRadius: 4 }} />
// //                 </div>
// //               </div>
// //             ))}
// //             <button style={{ width: "100%", marginTop: 6, padding: "10px", background: "#f0fdf4", border: "2px solid #d1fae5", borderRadius: 10, color: "#15803d", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
// //               📜 View Full Certificate
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Video Modal */}
// //       {selectedVideo && (
// //         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setSelectedVideo(null)}>
// //           <div style={{ background: "white", borderRadius: 24, overflow: "hidden", width: "100%", maxWidth: 640, boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
// //             <div style={{ background: `linear-gradient(135deg, ${selectedVideo.categoryColor}33, ${selectedVideo.categoryColor}55)`, height: 220, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
// //               <span style={{ fontSize: 72 }}>{selectedVideo.icon}</span>
// //               <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
// //                 <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>▶</div>
// //               </div>
// //             </div>
// //             <div style={{ padding: "24px" }}>
// //               <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
// //                 <span style={{ background: `${selectedVideo.categoryColor}20`, color: selectedVideo.categoryColor, padding: "3px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{selectedVideo.category}</span>
// //                 {selectedVideo.offlineAvailable && <span style={{ background: "#f0fdf4", color: "#15803d", padding: "3px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>📥 Offline Available</span>}
// //               </div>
// //               <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#111827" }}>{selectedVideo.title}</h2>
// //               <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>{selectedVideo.description}</p>
// //               <div style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 13, color: "#6b7280" }}>
// //                 <span>👨‍🏫 {selectedVideo.instructor}</span>
// //                 <span>⏱ {selectedVideo.duration}</span>
// //                 <span>★ {selectedVideo.rating}</span>
// //                 <span>👁 {selectedVideo.views} views</span>
// //               </div>
// //               <div style={{ display: "flex", gap: 10 }}>
// //                 <button style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg, #15803d, #16a34a)", border: "none", borderRadius: 12, color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
// //                   ▶ Watch Now
// //                 </button>
// //                 {selectedVideo.offlineAvailable && (
// //                   <button style={{ padding: "13px 20px", background: "#f0fdf4", border: "2px solid #d1fae5", borderRadius: 12, color: "#15803d", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
// //                     📥 Save Offline
// //                   </button>
// //                 )}
// //                 <button onClick={() => setSelectedVideo(null)} style={{ padding: "13px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, color: "#6b7280", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
// //                   ✕
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // src/app/citizen/learning/page.tsx
// 'use client';

// import { useState } from 'react';
// import { BookOpen, Video, FileText, Brain, TrendingUp, Award } from 'lucide-react';
// import AITutorChat from '@/components/learning/AITutorChat';

// export default function LearningPortal() {
//   const [activeTab, setActiveTab] = useState<'tutor' | 'videos' | 'documents'>('tutor');

//   const stats = [
//     { label: 'Learning Streak', value: '7 days', icon: TrendingUp, color: 'text-green-600' },
//     { label: 'Quizzes Taken', value: '12', icon: Award, color: 'text-purple-600' },
//     { label: 'Hours Learned', value: '24 hrs', icon: BookOpen, color: 'text-blue-600' },
//   ];

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Learning Portal</h1>
//           <p className="text-gray-600">Learn with AI tutor, videos, and interactive quizzes</p>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-500 text-sm">{stat.label}</p>
//                 <p className="text-2xl font-bold mt-2">{stat.value}</p>
//               </div>
//               <stat.icon className={`h-8 w-8 ${stat.color}`} />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Tabs */}
//       <div className="flex border-b bg-white rounded-t-xl">
//         <button
//           onClick={() => setActiveTab('tutor')}
//           className={`flex items-center px-6 py-3 font-medium transition ${
//             activeTab === 'tutor'
//               ? 'border-b-2 border-purple-600 text-purple-600'
//               : 'text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           <Brain className="h-5 w-5 mr-2" />
//           AI Tutor
//         </button>
//         <button
//           onClick={() => setActiveTab('videos')}
//           className={`flex items-center px-6 py-3 font-medium transition ${
//             activeTab === 'videos'
//               ? 'border-b-2 border-purple-600 text-purple-600'
//               : 'text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           <Video className="h-5 w-5 mr-2" />
//           Video Lessons
//         </button>
//         <button
//           onClick={() => setActiveTab('documents')}
//           className={`flex items-center px-6 py-3 font-medium transition ${
//             activeTab === 'documents'
//               ? 'border-b-2 border-purple-600 text-purple-600'
//               : 'text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           <FileText className="h-5 w-5 mr-2" />
//           Study Materials
//         </button>
//       </div>

//       {/* Content */}
//       <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
//         {activeTab === 'tutor' && <AITutorChat />}
        
//         {activeTab === 'videos' && (
//           <div className="p-6">
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="border rounded-lg overflow-hidden hover:shadow-md transition">
//                   <div className="h-40 bg-gray-200 flex items-center justify-center">
//                     <Video className="h-12 w-12 text-gray-400" />
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-semibold">Basic Math Skills</h3>
//                     <p className="text-sm text-gray-600 mt-1">Learn addition, subtraction, multiplication</p>
//                     <button className="mt-3 text-purple-600 text-sm font-medium">Watch Now →</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
        
//         {activeTab === 'documents' && (
//           <div className="p-6">
//             <div className="space-y-3 text-black">
//               {['Mathematics Basics', 'Science Notes', 'English Grammar'].map((doc, i) => (
//                 <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
//                   <div className="flex items-center">
//                     <FileText className="h-5 w-5 text-purple-600 mr-3" />
//                     <span>{doc}</span>
//                   </div>
//                   <button className="text-purple-600 text-sm">Download PDF</button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/app/citizen/learning/page.tsx - Updated with real content
"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Brain, TrendingUp, Award, Download, Wifi, WifiOff } from 'lucide-react';
import AITutorChat from '@/components/learning/AITutorChat';
import CourseCard from '@/components/learning/CourseCard';
import { useOfflineLearning } from '@/hooks/useOfflineLearning';
import { Course } from '@/types/learning';

// Actual educational video links (Royalty-free / Open source)
// Using sample videos from Blender Foundation and other open sources
const actualVideoLinks = {
  // Digital Literacy Course Videos
  computerBasics: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  internetBasics: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  digitalPayments: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4',
  
  // Agriculture Course Videos
  modernFarming: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  organicFarming: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  
  // English Course Videos
  englishGrammar: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  
  // Additional Educational Videos
  codingBasics: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCar.mp4',
  softSkills: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
};

// Actual PDF links (Educational resources - publicly available)
const actualPdfLinks = {
  digitalLiteracyHandbook: 'https://www.nielit.gov.in/sites/default/files/CCC_Syllabus.pdf',
  agricultureGuide: 'https://agriinfobank.com/wp-content/uploads/2023/01/Organic-Farming-Guide.pdf',
  englishGrammarBook: 'https://www.e-grammar.org/download/english-grammar-tenses.pdf',
  govtSchemesGuide: 'https://www.mygov.in/sites/default/files/Government_Schemes_Booklet.pdf',
  financialLiteracy: 'https://www.rbi.org.in/CommonPerson/English/Scripts/FinancialEducation.pdf'
};

// Sample courses with actual video and PDF links
const sampleCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Digital Literacy for Beginners',
    description: 'Learn basic computer skills, internet usage, and digital payments. Perfect for rural citizens starting their digital journey.',
    instructor: 'National Institute of Electronics & IT (NIELIT)',
    duration: 180,
    level: 'beginner',
    category: 'Digital Skills',
    thumbnail: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
    progress: 45,
    completed: false,
    videos: [
      {
        id: 'video-1',
        title: 'Introduction to Computers - Basic Hardware and Software',
        duration: 480, // 8 minutes
        url: actualVideoLinks.computerBasics,
        thumbnail: 'https://images.pexels.com/photos/38568/apple-imac-ipad-workplace-38568.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 100,
        lastPosition: 480,
        downloaded: true,
        downloadProgress: 100
      },
      {
        id: 'video-2',
        title: 'Using Internet and Email - Practical Guide',
        duration: 540, // 9 minutes
        url: actualVideoLinks.internetBasics,
        thumbnail: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 30,
        lastPosition: 162,
        downloaded: false,
        downloadProgress: 0
      },
      {
        id: 'video-3',
        title: 'Digital Payments and Banking - UPI, Mobile Wallets, Net Banking',
        duration: 600, // 10 minutes
        url: actualVideoLinks.digitalPayments,
        thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 0,
        lastPosition: 0,
        downloaded: false,
        downloadProgress: 0
      }
    ],
    documents: [
      {
        id: 'doc-1',
        title: 'Computer Literacy Handbook (CCC Syllabus)',
        type: 'pdf',
        url: actualPdfLinks.digitalLiteracyHandbook,
        size: 1.2,
        downloaded: false,
        downloadProgress: 0
      },
      {
        id: 'doc-2',
        title: 'Digital India - Complete Guide for Citizens',
        type: 'pdf',
        url: actualPdfLinks.govtSchemesGuide,
        size: 2.8,
        downloaded: false,
        downloadProgress: 0
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Modern Agriculture & Organic Farming',
    description: 'Learn scientific farming methods, organic agriculture techniques, and government agricultural schemes.',
    instructor: 'Indian Council of Agricultural Research (ICAR)',
    duration: 240,
    level: 'intermediate',
    category: 'Agriculture',
    thumbnail: 'https://images.pexels.com/photos/160360/field-wheat-agriculture-farming-160360.jpeg?auto=compress&cs=tinysrgb&w=600',
    progress: 0,
    completed: false,
    videos: [
      {
        id: 'video-4',
        title: 'Modern Farming Techniques - Irrigation, Fertilizers, Crop Rotation',
        duration: 540, // 9 minutes
        url: actualVideoLinks.modernFarming,
        thumbnail: 'https://images.pexels.com/photos/4504410/pexels-photo-4504410.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 0,
        lastPosition: 0,
        downloaded: false,
        downloadProgress: 0
      },
      {
        id: 'video-5',
        title: 'Organic Farming Methods - Natural Pesticides, Composting, Vermiculture',
        duration: 600, // 10 minutes
        url: actualVideoLinks.organicFarming,
        thumbnail: 'https://images.pexels.com/photos/1583105/pexels-photo-1583105.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 0,
        lastPosition: 0,
        downloaded: false,
        downloadProgress: 0
      }
    ],
    documents: [
      {
        id: 'doc-3',
        title: 'Organic Farming Complete Guide (PDF)',
        type: 'pdf',
        url: actualPdfLinks.agricultureGuide,
        size: 3.5,
        downloaded: false,
        downloadProgress: 0
      },
      {
        id: 'doc-4',
        title: 'PM-KISAN Scheme - Farmers Guide',
        type: 'pdf',
        url: actualPdfLinks.govtSchemesGuide,
        size: 1.5,
        downloaded: false,
        downloadProgress: 0
      }
    ]
  },
  {
    id: 'course-3',
    title: 'English Communication & Soft Skills',
    description: 'Improve your English speaking, writing, grammar, and interview preparation skills.',
    instructor: 'National Skill Development Corporation',
    duration: 200,
    level: 'beginner',
    category: 'Language',
    thumbnail: 'https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg?auto=compress&cs=tinysrgb&w=600',
    progress: 0,
    completed: false,
    videos: [
      {
        id: 'video-6',
        title: 'Basic English Grammar - Tenses, Parts of Speech',
        duration: 720, // 12 minutes
        url: actualVideoLinks.englishGrammar,
        thumbnail: 'https://images.pexels.com/photos/4145197/pexels-photo-4145197.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 0,
        lastPosition: 0,
        downloaded: false,
        downloadProgress: 0
      }
    ],
    documents: [
      {
        id: 'doc-5',
        title: 'Complete English Grammar Guide (PDF)',
        type: 'pdf',
        url: actualPdfLinks.englishGrammarBook,
        size: 4.2,
        downloaded: false,
        downloadProgress: 0
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Financial Literacy & Banking',
    description: 'Learn about savings, investments, loans, insurance, and government financial schemes.',
    instructor: 'Reserve Bank of India',
    duration: 150,
    level: 'beginner',
    category: 'Finance',
    thumbnail: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=600',
    progress: 0,
    completed: false,
    videos: [
      {
        id: 'video-7',
        title: 'Basics of Banking - Savings Account, Fixed Deposits, Loans',
        duration: 540, // 9 minutes
        url: actualVideoLinks.computerBasics,
        thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=600',
        progress: 0,
        lastPosition: 0,
        downloaded: false,
        downloadProgress: 0
      }
    ],
    documents: [
      {
        id: 'doc-6',
        title: 'Financial Education Handbook (RBI)',
        type: 'pdf',
        url: actualPdfLinks.financialLiteracy,
        size: 2.1,
        downloaded: false,
        downloadProgress: 0
      }
    ]
  }
];

export default function LearningPortal() {
  const [activeTab, setActiveTab] = useState<'courses' | 'tutor' | 'downloads'>('courses');
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const { isOnline, downloadQueue, storageInfo, downloadVideo, getOfflineVideo, deleteOfflineVideo, saveProgress } = useOfflineLearning();

  // Load saved download status from localStorage
  useEffect(() => {
    const savedDownloads = localStorage.getItem('downloadedContent');
    if (savedDownloads) {
      const downloadedIds = JSON.parse(savedDownloads);
      setCourses(prev => prev.map(course => ({
        ...course,
        videos: course.videos.map(video => ({
          ...video,
          downloaded: downloadedIds.includes(video.id)
        })),
        documents: course.documents.map(doc => ({
          ...doc,
          downloaded: downloadedIds.includes(doc.id)
        }))
      })));
    }
  }, []);

  const stats = [
    { label: 'Learning Streak', value: '7 days', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Courses Enrolled', value: courses.length.toString(), icon: BookOpen, color: 'text-blue-600' },
    { label: 'Hours Learned', value: `${Math.floor(courses.flatMap(c => c.videos).reduce((sum, v) => sum + (v.progress / 100) * (v.duration / 60), 0))} hrs`, icon: Award, color: 'text-purple-600' },
    { label: 'Downloads', value: `${courses.flatMap(c => c.videos).filter(v => v.downloaded).length} items`, icon: Download, color: 'text-orange-600' }
  ];

  const handleProgressUpdate = (courseId: string, progress: number) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, progress, completed: progress === 100 }
        : course
    ));
  };

  const handleDownload = async (video: Video) => {
    try {
      await downloadVideo(video, (progress) => {
        setCourses(prev => prev.map(course => ({
          ...course,
          videos: course.videos.map(v => 
            v.id === video.id ? { ...v, downloadProgress: progress } : v
          )
        })));
      });
      
      // Mark as downloaded
      setCourses(prev => prev.map(course => ({
        ...course,
        videos: course.videos.map(v => 
          v.id === video.id ? { ...v, downloaded: true, downloadProgress: 100 } : v
        )
      })));
      
      // Save to localStorage
      const downloadedIds = JSON.parse(localStorage.getItem('downloadedContent') || '[]');
      if (!downloadedIds.includes(video.id)) {
        downloadedIds.push(video.id);
        localStorage.setItem('downloadedContent', JSON.stringify(downloadedIds));
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please check your internet connection and try again.');
    }
  };

  const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0) / courses.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Portal</h1>
          <p className="text-gray-600">Free skill development courses with offline access</p>
        </div>
        <div className="flex items-center space-x-3">
          {isOnline ? (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <Wifi className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
              <WifiOff className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          )}
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            💾 Storage: {storageInfo.used} / {storageInfo.available}
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Your Learning Journey</h3>
            <p className="text-blue-100 text-sm">Complete courses to earn certificates</p>
          </div>
          <Award className="h-8 w-8 opacity-75" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-100 mt-2">
            {totalProgress === 100 ? '🎉 Congratulations! You\'ve completed all courses!' : '📚 Keep learning to improve your skills'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-black">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center px-5 py-3 font-medium transition whitespace-nowrap ${
            activeTab === 'courses'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="h-5 w-5 mr-2" />
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex items-center px-5 py-3 font-medium transition whitespace-nowrap ${
            activeTab === 'tutor'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="h-5 w-5 mr-2" />
          AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex items-center px-5 py-3 font-medium transition whitespace-nowrap ${
            activeTab === 'downloads'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="h-5 w-5 mr-2" />
          Downloads
          {downloadQueue.filter(d => d.status === 'downloading').length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {downloadQueue.filter(d => d.status === 'downloading').length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
        {activeTab === 'courses' && (
          <div className="p-6 space-y-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onProgressUpdate={handleProgressUpdate}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'tutor' && (
          <div className="h-[600px]">
            <AITutorChat />
          </div>
        )}
        
        {activeTab === 'downloads' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Download Manager</h3>
            {downloadQueue.length === 0 ? (
              <div className="text-center py-12">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active downloads</p>
                <p className="text-sm text-gray-500 mt-2">Click "Save Offline" on any video to download</p>
              </div>
            ) : (
              <div className="space-y-3">
                {downloadQueue.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{Math.round(item.progress)}%</span>
                        {item.status === 'completed' && (
                          <span className="text-green-600 text-sm">✓ Saved offline</span>
                        )}
                        {item.status === 'failed' && (
                          <span className="text-red-600 text-sm">Failed - Retry</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Downloaded Items */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 mb-3">Downloaded Content</h4>
              <div className="space-y-2">
                {courses.flatMap(c => c.videos).filter(v => v.downloaded).map(video => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Download className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{video.title}</p>
                        <p className="text-xs text-gray-500">Available offline</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteOfflineVideo(video.id)}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {courses.flatMap(c => c.videos).filter(v => v.downloaded).length === 0 && (
                  <p className="text-gray-500 text-sm">No downloaded content yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <WifiOff className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">You're offline</p>
              <p className="text-sm text-yellow-700">
                Downloaded videos and documents are still accessible. New content will sync when you're back online.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
