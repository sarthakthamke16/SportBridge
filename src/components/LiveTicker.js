import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

export default function LiveTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get(`${API_BASE}/feed`);
        setItems(res.data);
      } catch (e) {
        // Fallback default items
        setItems([
          { text: "Rohan P. applied to Shahu Stadium Athletics Club", time: "1d ago" },
          { text: "Sneha J. invited for trial by Deccan Football Academy", time: "1d ago" },
          { text: "Rohan P. applied to Rajaram Cricket Stadium", time: "1d ago" },
          { text: "New Camp: Sangli Junior Badminton Selection Camp", time: "1d ago" },
          { text: "Sneha J. shortlisted by Kolhapur Kings Cricket Academy", time: "1d ago" },
          { text: "Rohan P. applied to Deccan Football Academy", time: "1d ago" }
        ]);
      }
    };
    fetchFeed();
    const interval = setInterval(fetchFeed, 15000);
    return () => clearInterval(interval);
  }, []);

  const displayList = items.length > 0 ? items : [
    { text: "Rohan P. applied to Shahu Stadium Athletics Club", time: "1d ago" },
    { text: "Sneha J. invited for trial by Deccan Football Academy", time: "1d ago" }
  ];

  return (
    <div className="bg-[#0b0e14] border-b border-[#21262d] text-xs h-9 flex items-center overflow-hidden z-50">
      <div className="bg-[#FF4500] text-white font-black px-3.5 h-full flex items-center tracking-wider text-[11px] shrink-0 gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        LIVE
      </div>
      <div className="relative w-full overflow-hidden flex items-center">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {displayList.concat(displayList).map((item, idx) => (
            <div key={idx} className="flex items-center mx-5 text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 inline-block"></span>
              <span className="font-medium text-gray-200">{item.text}</span>
              <span className="text-gray-500 ml-1.5">· {item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
