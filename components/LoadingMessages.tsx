"use client";

import { useState, useEffect, useMemo } from "react";
import { SlideStyle } from "@/lib/styles";

const GENERIC_MESSAGES = [
  "Cooking up something ridiculous...",
  "Consulting the chaos gremlins...",
  "Asking the rubber duck for advice...",
  "Teaching pigeons PowerPoint...",
  "Polishing the nonsense...",
  "Calibrating absurdity levels...",
  "Brewing chaotic energy...",
  "Asking a raccoon for bullet points...",
  "Downloading more ridiculous...",
  "Generating plausible nonsense...",
  "Inventing fake statistics...",
  "Assembling the chaos...",
  "Consulting ancient memes...",
  "Waking up the slide hamsters...",
  "Mixing metaphors aggressively...",
  "Loading premium nonsense...",
];

const STYLE_MESSAGES: Partial<Record<SlideStyle, string[]>> = {
  retro: [
    "Rewinding the VHS tape...",
    "Adjusting the tracking...",
    "Loading radical content...",
    "Synthesizing the synth waves...",
    "Booting up the DeLorean...",
    "Inserting floppy disk 1 of 47...",
    "Channeling the 80s energy...",
    "Adding more neon...",
  ],
  comic: [
    "POW! Loading slides...",
    "Drawing speech bubbles...",
    "Adding halftone dots...",
    "WHAM! Almost there...",
    "Consulting Spider-Man...",
    "Inking the chaos...",
    "KAPOW! Generating content...",
    "Assembling the Avengers of nonsense...",
  ],
  chalkboard: [
    "Dusting off the chalk...",
    "Writing on the board...",
    "Erasing mistakes (there are many)...",
    "Finding the good chalk...",
    "Avoiding the squeaky parts...",
    "Channeling teacher energy...",
    "Class is almost in session...",
    "Detention for bad slides...",
  ],
  scifi: [
    "Initializing hyperdrive...",
    "Scanning for alien wisdom...",
    "Downloading from the mothership...",
    "Calibrating the flux capacitor...",
    "Engaging warp speed...",
    "Consulting the ship's AI...",
    "Translating from Klingon...",
    "Activating holographic projector...",
  ],
  vaporwave: [
    "A E S T H E T I C loading...",
    "Consulting the Greek statues...",
    "Downloading from the void...",
    "Adding more palm trees...",
    "Glitching aesthetically...",
    "Channeling internet dreams...",
    "Loading Windows 95...",
    "Vaporizing the content...",
  ],
  pixel: [
    "Loading... please wait...",
    "Insert coin to continue...",
    "Player 1 ready...",
    "Blowing on the cartridge...",
    "Pixel by pixel...",
    "Press START to begin...",
    "Collecting power-ups...",
    "8-bit magic incoming...",
  ],
  corporate: [
    "Synergizing the deliverables...",
    "Leveraging core competencies...",
    "Circling back to the slides...",
    "Aligning with stakeholders...",
    "Optimizing the pipeline...",
    "Running it up the flagpole...",
    "Taking this offline...",
    "Thinking outside the box...",
  ],
  vintage: [
    "Aging the parchment...",
    "Consulting the scholars...",
    "Dusting off the archives...",
    "Brewing some tea first...",
    "Adding sepia tones...",
    "Channeling academia...",
    "Referencing obscure texts...",
    "Adjusting the monocle...",
  ],
  minimalist: [
    "Removing unnecessary elements...",
    "Embracing white space...",
    "Less is loading...",
    "Simplifying complexity...",
    "Finding the essence...",
    "Decluttering thoughts...",
    "Achieving zen...",
    "Almost nothing left to load...",
  ],
  nature: [
    "Growing organic content...",
    "Consulting the trees...",
    "Photosynthesizing ideas...",
    "Letting it bloom...",
    "Watering the slides...",
    "Channeling forest energy...",
    "Composting bad ideas...",
    "Going outside briefly...",
  ],
  newspaper: [
    "EXTRA! EXTRA! Loading...",
    "Breaking news incoming...",
    "Stop the presses...",
    "Interviewing sources...",
    "Fact-checking (just kidding)...",
    "Writing the headline...",
    "SHOCKING revelations loading...",
    "You won't BELIEVE these slides...",
  ],
  noir: [
    "It was a dark and stormy load...",
    "The slides walked in...",
    "Pouring a stiff drink...",
    "Adjusting the fedora...",
    "The dame had questions...",
    "Following the clues...",
    "Lighting a metaphorical cigarette...",
    "The city never sleeps...",
  ],
  kawaii: [
    "So kawaii! Loading~",
    "Adding sparkles ✨...",
    "Making it extra cute...",
    "Consulting the cat cafe...",
    "Sprinkling happiness...",
    "Drawing tiny faces on everything...",
    "Maximum cuteness engaged...",
    "UwU almost ready...",
  ],
  cyberpunk: [
    "Jacking into the mainframe...",
    "Hacking the Gibson...",
    "Downloading from the net...",
    "Chrome and neon loading...",
    "The future is now...",
    "Glitching intentionally...",
    "Running in the rain...",
    "Consulting the street samurai...",
  ],
  watercolor: [
    "Letting the colors bleed...",
    "Wetting the paper...",
    "Painting outside the lines...",
    "Blending gently...",
    "Adding artistic splashes...",
    "Channeling Bob Ross vibes...",
    "Happy little accidents loading...",
    "Drying the brushes...",
  ],
  medieval: [
    "Illuminating the manuscript...",
    "Consulting the monks...",
    "Adding gold leaf...",
    "Scribing by candlelight...",
    "Slaying the dragon first...",
    "Thou slides art loading...",
    "Summoning the court jester...",
    "Hark! Almost ready...",
  ],
  horror: [
    "The slides are coming from inside...",
    "Don't look behind you...",
    "Something stirs in the darkness...",
    "The content hungers...",
    "It's too quiet...",
    "Loading... if you dare...",
    "The ritual is almost complete...",
    "They're here...",
  ],
};

interface LoadingMessagesProps {
  style?: SlideStyle;
  interval?: number;
}

export default function LoadingMessages({ style, interval = 2500 }: LoadingMessagesProps) {
  const messages = useMemo(() => {
    const styleMessages = style ? STYLE_MESSAGES[style] : undefined;
    if (styleMessages && styleMessages.length > 0) {
      // Mix style-specific with some generic ones
      return [...styleMessages, ...GENERIC_MESSAGES.slice(0, 4)];
    }
    return GENERIC_MESSAGES;
  }, [style]);

  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * messages.length)
  );
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Reset to a new random message when style changes
    setMessageIndex(Math.floor(Math.random() * messages.length));
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setMessageIndex((prev) => {
          let next = Math.floor(Math.random() * messages.length);
          // Avoid showing the same message twice in a row
          while (next === prev && messages.length > 1) {
            next = Math.floor(Math.random() * messages.length);
          }
          return next;
        });
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, messages.length]);

  return (
    <h2
      className={`text-3xl font-semibold text-white mb-2 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {messages[messageIndex]}
    </h2>
  );
}
