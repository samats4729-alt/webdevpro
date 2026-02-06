
"use client";

import React from 'react';
import styled from 'styled-components';

interface HolographicTicketProps {
  qrCodeUrl: string;
}

const HolographicTicket: React.FC<HolographicTicketProps> = ({ qrCodeUrl }) => {
  const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

  return (
    <StyledWrapper>
      <div>
        <div className="output">
          <div className="wrap-colors-1"><div className="bg-colors" /></div>
          <div className="wrap-colors-2"><div className="bg-colors" /></div>
          <div className="cover" />
        </div>
        <div className="area">
          <div className="area-wrapper">
            <div className="ticket-mask">
              <div className="ticket">
                <div className="ticket-flip-container">
                  <div className="float">
                    <div className="front">
                      <div className="ticket-body">
                        <div className="reflex" />
                        <svg className="icon-cube" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path style={{ '--i': 1 } as any} className="path-center" d="M12 12.75L14.25 11.437M12 12.75L9.75 11.437M12 12.75V15" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                          <path style={{ '--i': 2 } as any} className="path-t" d="M9.75 3.562L12 2.25L14.25 3.563" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                          <path style={{ '--i': 3 } as any} className="path-tr" d="M21 7.5L18.75 6.187M21 7.5V9.75M21 7.5L18.75 8.813" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                          <path style={{ '--i': 4 } as any} className="path-br" d="M21 14.25V16.5L18.75 17.813" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                          <path style={{ '--i': 5 } as any} className="path-b" d="M12 21.75L14.25 20.437M12 21.75V19.5M12 21.75L9.75 20.437" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                          <path style={{ '--i': 6 } as any} className="path-bl" d="M5.25 17.813L3 16.5V14.25" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                          <path style={{ '--i': 7 } as any} className="path-tl" d="M3 7.5L5.25 6.187M3 7.5L5.25 8.813M3 7.5V9.75" stroke="black" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <header>
                          <div className="ticket-name">
                            <div>
                              <span style={{ '--i': 1 } as any}>W</span>
                              <span style={{ '--i': 2 } as any}>H</span>
                              <span style={{ '--i': 3 } as any}>A</span>
                              <span style={{ '--i': 4 } as any}>T</span>
                              <span style={{ '--i': 5 } as any}>S</span>
                              <span style={{ '--i': 6 } as any}>A</span>
                              <span style={{ '--i': 7 } as any}>P</span>
                              <span style={{ '--i': 8 } as any}>P</span>
                            </div>
                            <div>
                              <span className="bold" style={{ '--i': 9 } as any}>B</span>
                              <span className="bold" style={{ '--i': 10 } as any}>O</span>
                              <span className="bold" style={{ '--i': 11 } as any}>T</span>
                            </div>
                          </div>
                          <div className="barcode" />
                        </header>
                        <div className="contents">
                          <div className="event">
                            <div>
                              <span className="bold">CONNECT</span>
                            </div>
                            <div>NOW</div>
                          </div>
                          <div className="qrcode">
                            <img src={qrCodeUrl} alt="QR Code" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="back">
                      <div className="ticket-body">
                        <div className="reflex" />
                        <header>
                          <div className="ticket-name">
                            <div>
                              <span style={{ '--i': 1 } as any}>W</span>
                              <span style={{ '--i': 2 } as any}>H</span>
                              <span style={{ '--i': 3 } as any}>A</span>
                              <span style={{ '--i': 4 } as any}>T</span>
                              <span style={{ '--i': 5 } as any}>S</span>
                              <span style={{ '--i': 6 } as any}>A</span>
                              <span style={{ '--i': 7 } as any}>P</span>
                              <span style={{ '--i': 8 } as any}>P</span>
                            </div>
                            <b>
                              <span className="bold" style={{ '--i': 9 } as any}>B</span>
                              <span className="bold" style={{ '--i': 10 } as any}>O</span>
                              <span className="bold" style={{ '--i': 11 } as any}>T</span>
                            </b>
                          </div>
                          <time dateTime={new Date().toISOString()}>
                            {currentDate}
                          </time>
                        </header>
                        <div className="contents">
                          <div className="qrcode">
                            <img src={qrCodeUrl} alt="QR Code" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="noise">
          <svg height="100%" width="100%">
            <defs>
              <pattern height={500} width={500} patternUnits="userSpaceOnUse" id="noise-pattern">
                <filter y={0} x={0} id="noise">
                  <feTurbulence stitchTiles="stitch" numOctaves={3} baseFrequency="0.65" type="fractalNoise" />
                  <feBlend mode="screen" />
                </filter>
                <rect filter="url(#noise)" height={500} width={500} />
              </pattern>
            </defs>
            <rect fill="url(#noise-pattern)" height="100%" width="100%" />
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Ensure the container has size for the effect */
  width: 100%;
  height: 500px; /* Reduced from standard because it was cutting off */
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .output {
    align-self: center;
    background: inherit;
    border-radius: 100px;
    padding: 0 12px 0 10px;
    height: 36px;
    min-width: 350px;
    position: relative;
    top: -140px;
    display: none; /* Hidden as per previous visual context it might distract */

    .cover {
      position: absolute;
      top: 2px;
      right: 2px;
      bottom: 2px;
      left: 2px;
      border-radius: 100px;
      clip-path: inset(0 0 0 0 round 100px);
      background: #101216;
      transition: filter 1000ms cubic-bezier(0, 0, 0, 1);
      filter: blur(5px);
    }
    .cover::after {
      content: "";
      top: -10px;
      right: -10px;
      bottom: -10px;
      left: -10px;
      border-radius: 100px;
      position: absolute;
      background: inherit;
      opacity: 0.5;
    }

    .wrap-colors-1,
    .wrap-colors-2 {
      overflow: hidden;
      border-radius: 100px;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
    }
    .wrap-colors-1 {
      opacity: 0.35;
      filter: blur(3px);
    }
    .bg-colors {
      background: conic-gradient(
        transparent 0deg,
        #8400ff 65deg,
        #00ccff 144deg,
        #1356b4 180deg,
        transparent 324deg,
        transparent 360deg
      );
      position: absolute;
      width: 400px;
      height: 400px;
      margin: auto;
      inset: 0;
      left: 50%;
      transform: translateX(-50%) rotate(220deg);
      border-radius: 50%;
      animation: cycle-rotate 3s ease-in-out infinite;
    }
  }
  
  /* Adjusted for containment */
  .area {
    --ease-elastic: cubic-bezier(0.5, 2, 0.3, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative; /* Changed from absolute to play nice with layout */
    width: 100%;
    height: 100%;

    .area-wrapper {
        position: relative;
        z-index: 10;
      &:hover .wrapper {
        transform: translateY(0) scale(1);
        box-shadow: 0 20px 50px -5px black;
      }
    }
  }

  .area::after {
    pointer-events: none;
    content: "";
    position: absolute;
    top: 66%;
    left: 0;
    right: 0;
    height: 100px;
    width: 30%;
    margin: auto;
    background-color: #648cc630;
    filter: blur(2em);
    opacity: 0.7;
    transform: perspective(10px) rotateX(5deg) scale(1, 0.5);
    z-index: 0;
  }

  .ticket-mask {
    position: relative;
    overflow: hidden; /* Hide ticket when inside machine */
    display: flex;
    justify-content: center;
    perspective: 1000px;
    height: 480px; 
    width: 340px;
    padding-top: 60px; /* Space for the slot */
    mask-image: linear-gradient(to bottom, transparent 0px, transparent 40px, black 60px); /* Soft mask at slot */
  }

  /* Dispenser Slot Visual */
  .ticket-mask::before {
    content: "";
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 340px;
    height: 12px;
    background: #0f1114;
    border-radius: 6px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.1);
    z-index: 50;
    border: 1px solid #333;
  }
  /* Neon Light strip on slot */
  .ticket-mask::after {
    content: "";
    position: absolute;
    top: 35px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 2px;
    background: #00ff66;
    box-shadow: 0 0 10px #00ff66, 0 0 5px #00ff66;
    z-index: 51;
    border-radius: 2px;
    opacity: 0.8;
  }

  .ticket {
    float: left;
    /* Slow print animation: coming out of the slot */
    animation: ticket-print 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform: translateY(-120%); /* Start fully hidden inside */
    perspective: 3000px;
    transform-origin: top center;
  }

  @keyframes ticket-print {
    0% {
      transform: translateY(-120%);
    }
    100% {
      transform: translateY(0);
    }
  }

  .ticket:hover .ticket-flip-container {
    transform: rotateY(180deg);
  }

  .ticket-flip-container {
    transition: 0.6s;
    transform-style: preserve-3d;
    position: relative;
  }

  .float {
    transform-style: preserve-3d;
    pointer-events: none; /* Changed to all for QR interaction if needed, but none for card flip */
    animation: float 3s ease-in-out infinite;
  }

  .front,
  .back {
    display: inline-block;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .front {
    z-index: 1;
  }

  .back {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(-180deg);
  }

  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .icon-cube {
    position: absolute;
    height: 110%;
    z-index: 1;
    top: -3px;
    left: 0;
    right: 0;
    margin: auto;
    mix-blend-mode: soft-light;
    opacity: 0.6;
  }

  .icon-cube path {
    animation-delay: calc(var(--i) * 100ms) !important;
    transform-origin: center;
  }

  .icon-cube .path-center {
    animation: path-center 3s ease-in-out infinite;
  }
  @keyframes path-center {
    50% {
      transform: scale(1.3);
    }
  }

  .icon-cube .path-t {
    animation: path-t 1.6s ease-in-out infinite;
  }
  @keyframes path-t {
    50% {
      transform: translateY(1px);
    }
  }

  .icon-cube .path-tl {
    animation: path-tl 1.6s ease-in-out infinite;
  }
  @keyframes path-tl {
    50% {
      transform: translateX(1px) translateY(1px);
    }
  }

  .icon-cube .path-tr {
    animation: path-tr 1.6s ease-in-out infinite;
  }
  @keyframes path-tr {
    50% {
      transform: translateX(-1px) translateY(1px);
    }
  }

  .icon-cube .path-br {
    animation: path-br 1.6s ease-in-out infinite;
  }
  @keyframes path-br {
    50% {
      transform: translateX(-1px) translateY(-1px);
    }
  }

  .icon-cube .path-bl {
    animation: path-bl 1.6s ease-in-out infinite;
  }
  @keyframes path-bl {
    50% {
      transform: translateX(1px) translateY(-1px);
    }
  }

  .icon-cube .path-b {
    animation: path-b 1.6s ease-in-out infinite;
  }
  @keyframes path-b {
    50% {
      transform: translateY(-1px);
    }
  }

  .ticket-body {
    display: block;
    position: relative;
    width: 320px;
    margin-bottom: 20px;
    padding: 0;
    border-radius: 7px 7px 0px 0px;
    background-color: white;
    text-align: center;
    background: linear-gradient(to bottom, white, #dcfffd);
    color: black;

    svg,
    img {
      /* pointer-events: none; */ /* Enabled pointer events for QR */
    }

    .bold {
      font-weight: 800;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      padding: 15px;
      border-bottom: 1px dashed rgba(0, 0, 0, 0.4);
      text-align: left;
      height: 54px;

      .ticket-name {
        font-weight: 300;
        font-size: 1.05em;
        line-height: normal;
        align-items: center;
        display: flex;
        gap: 0px; /* Reduced gap */
        letter-spacing: -1px;
      }
      
      .ticket-name span {
         min-width: 8px; /* Fixed width for better alignment */
         text-align: center;
      }

      span {
        display: inline-block;
      }

      time {
        display: flex;
        font-weight: bold;
        opacity: 0.7;
      }

      .slash {
        padding: 0 1px;
        color: rgba(0, 0, 0, 0.4);
      }
    }
    header::after,
    header::before {
      content: "";
      display: block;
      width: 13px;
      height: 13px;
      background-color: #0f1114;
      position: absolute;
      right: -8px;
      border-radius: 50%;
      z-index: 11;
      bottom: -7px;
    }
    header:after {
      left: -8px;
    }
    .contents {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      min-height: 250px; /* Increased height for QR */
      position: relative;
      pointer-events: all;

      .event {
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        margin-top: -30px;
        font-weight: 600;

        span {
          display: inline-block;
          height: 15px;
          font-size: 3rem;
          font-weight: 400;
          line-height: 1;
        }
        span.bold {
          font-size: 2.18rem;
          font-weight: 800;
          margin-right: -3px;
        }

        div:nth-child(2) {
          font-size: 13px;
          letter-spacing: 0.45em;
          margin-left: 6px;
          color: #2f4c8b62;
        }
      }

      .number {
        position: absolute;
        left: 15px;
        bottom: -6px;
        font-size: 2em;
        color: #b5ddff;
        font-weight: bolder;
      }
    }
  }
  .ticket-body:after {
    content: "";
    display: block;
    position: absolute;
    bottom: -16px;
    left: 0;
    background:
      -webkit-linear-gradient(-135deg, #dcfffd 50%, transparent 50%) 0 50%,
      -webkit-linear-gradient(-45deg, #dcfffd 50%, transparent 50%) 0 50%,
      transparent;
    background-repeat: repeat-x;
    background-size:
      16px 16px,
      16px 16px,
      cover,
      cover;
    height: 16px;
    width: 100%;
    pointer-events: none;
  }

  .barcode {
    box-shadow:
      1px 0 0 1px,
      5px 0 0 1px,
      10px 0 0 1px,
      11px 0 0 1px,
      15px 0 0 1px,
      18px 0 0 1px,
      22px 0 0 1px,
      23px 0 0 1px,
      26px 0 0 1px,
      30px 0 0 1px,
      35px 0 0 1px,
      37px 0 0 1px,
      41px 0 0 1px,
      44px 0 0 1px,
      47px 0 0 1px,
      51px 0 0 1px,
      56px 0 0 1px,
      59px 0 0 1px,
      64px 0 0 1px,
      68px 0 0 1px,
      72px 0 0 1px,
      74px 0 0 1px,
      77px 0 0 1px,
      81px 0 0 1px,
      85px 0 0 1px,
      88px 0 0 1px,
      92px 0 0 1px,
      95px 0 0 1px,
      96px 0 0 1px,
      97px 0 0 1px;
    display: inline-block;
    height: 30px;
    width: 0;
    left: 70%;
    position: absolute;
    top: 12px;
    opacity: 0.5;
  }

  @keyframes appear {
    0% {
      opacity: 0;
      transform: translateX(100%);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes appear2 {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .back header span {
    animation: none;
  }
  .ticket:hover .back header span {
    opacity: 0;
    animation: appear 0.5s var(--ease-elastic) forwards
      calc(var(--i) * 20ms + 400ms);
  }

  .ticket:hover .front header span {
    opacity: 1;
    animation: appear2;
  }
  .front header span {
    opacity: 0;
    animation: appear 0.5s var(--ease-elastic) forwards
      calc(var(--i) * 20ms + 400ms);
  }

  .qrcode {
    position: absolute;
    z-index: 10;
    color: #a5b7eb;
    background: white;
    padding: 10px;
    border-radius: 10px;

    img {
      display: block;
      height: 180px;
      width: 180px;
      object-fit: contain;
    }
  }
  .back .qrcode {
    margin-top: 8px;
  }
  .back .qrcode::after {
    --stroke-width: 0.2rem;
    --corner-size: 1rem;

    position: absolute;
    content: "";
    background:
      linear-gradient(
          to right,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 0,
      linear-gradient(
          to right,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 100%,
      linear-gradient(
          to left,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 0,
      linear-gradient(
          to left,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 100%,
      linear-gradient(
          to bottom,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 0,
      linear-gradient(
          to bottom,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 0,
      linear-gradient(
          to top,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        0 100%,
      linear-gradient(
          to top,
          currentColor var(--stroke-width),
          transparent var(--stroke-width)
        )
        100% 100%;
    background-size: var(--corner-size) var(--corner-size);
    inset: 0;
    background-repeat: no-repeat;
  }
  .back .qrcode::after {
    animation: breath 3s var(--ease-elastic) infinite;
  }

  @keyframes breath {
    0% {
      transform: scale(1.05);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1.05);
      opacity: 0.3;
    }
  }

  .reflex {
    pointer-events: none;
    position: absolute;
    inset: 0;
    bottom: -5px;
    z-index: 10;
    overflow: hidden;
  }
  .reflex::before {
    content: "";
    position: absolute;
    width: 300px;
    background-color: rgba(255, 255, 255, 0.4);
    background: linear-gradient(
      to right,
      rgba(221, 249, 255, 0.4) 10%,
      rgba(221, 245, 255, 0.7) 60%,
      rgba(221, 246, 255, 0.6) 60%,
      rgba(221, 255, 254, 0.4) 90%
    );
    top: -10%;
    bottom: -10%;
    left: -132%;
    transform: translateX(0) skew(-30deg);
    transition: all 0.7s ease;
  }
  .float:hover .reflex::before {
    transform: translate(280%, 0) skew(-30deg);
  }
  .float .front .reflex::before {
    transition-delay: 0.3s;
  }

  .ticket-body::before {
    content: "";
    position: absolute;
    inset: 0;
    mask-image: linear-gradient(white 50%, transparent 100%);
    border-radius: 7px 7px 0px 0px;
    background: radial-gradient(
        at 30% -5%,
        #90f1f1,
        #d3ccf0,
        rgba(255, 255, 255, 0) 25%
      ),
      radial-gradient(at 30% 40%, #aad1f0, rgba(255, 255, 255, 0) 20%),
      radial-gradient(at 50% 70%, #c4f2e5, rgba(255, 255, 255, 0) 30%),
      radial-gradient(at 70% 0%, #d3ccf0, rgba(255, 255, 255, 0) 20%),
      linear-gradient(
        75deg,
        #90f1f1 5%,
        rgba(255, 255, 255, 0),
        #aad1f0,
        rgba(255, 255, 255, 0),
        #e9d0ed,
        rgba(255, 255, 255, 0),
        #d3ccf0,
        rgba(255, 255, 255, 0),
        #c4f2e5 90%
      ),
      radial-gradient(at 30% 50%, #90f1f1, rgba(255, 255, 255, 0) 30%),
      radial-gradient(at 30% 50%, #9cb9fc, rgba(255, 255, 255, 0) 30%),
      radial-gradient(at 100% 50%, #90f1f1, #c2dcf2, rgba(255, 255, 255, 0) 50%),
      linear-gradient(
        115deg,
        #90f1f1 5%,
        #aad1f0 10%,
        #d3ccf0,
        #e9d0ed 20%,
        #aad1f0,
        #aad1f0 30%,
        #d3ccf0,
        #c2dcf2 40%,
        #90f1f1,
        #aad1f0 70%
      );
  }

  .noise {
    position: absolute;
    top: -25px;
    bottom: -20px;
    left: 0;
    right: 0;
    opacity: 0.07;
    mask-image: linear-gradient(
      transparent 5%,
      white 30%,
      white 70%,
      transparent 95%
    );
    filter: grayscale(1);
    pointer-events: none;
    z-index: 1;
  }
`;

export default HolographicTicket;
