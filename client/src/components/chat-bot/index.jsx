import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";

const Chatbot = () => {
    const [hmac, setHmac] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Fetch HMAC token from backend
        axiosInstance.get("/generate-chat-token")
            .then(response => {
                setHmac(response.data.hmac);
                setUserId(response.data.userId);
            })
            .catch(error => console.error("Error fetching chat token:", error));
    }, []);

    useEffect(() => {
        if (hmac && userId) {
            (function () {
                if (!window.chatbase || window.chatbase("getState") !== "initialized") {
                    window.chatbase = function (...args) {
                        if (!window.chatbase.q) { window.chatbase.q = [] }
                        window.chatbase.q.push(args)
                    };

                    window.chatbase = new Proxy(window.chatbase, {
                        get(target, prop) {
                            if (prop === "q") { return target.q }
                            return (...args) => target(prop, ...args)
                        }
                    });
                }
                const onLoad = function () {
                    const script = document.createElement("script");
                    script.src = "https://www.chatbase.co/embed.min.js";
                    script.id = "aR7PpS8jDX66JkgBjdDah"; // Replace with your actual Chatbase chatbot ID
                    script.dataset.userId = userId;
                    script.dataset.hmac = hmac;
                    document.body.appendChild(script);
                };
                if (document.readyState === "complete") { onLoad() }
                else { window.addEventListener("load", onLoad) }
            })();
        }
    }, [hmac, userId]);

    return null; // No UI needed, the chatbot loads automatically
};

export default Chatbot;
