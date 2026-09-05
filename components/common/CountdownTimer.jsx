"use client";
import React, { useState, useEffect, useRef } from "react";
import { APPLICATION_DEADLINE } from "@/lib/config";

/**
 * A single unit of the countdown. Hoisted out of the parent so it is not
 * redefined (and its subtree remounted) on every tick.
 *
 * The value is exposed to assistive tech via a polite, human-readable label
 * rather than announcing the raw two-digit number every second.
 */
const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div
      aria-hidden="true"
      className="font-display text-2xl font-bold tracking-wider text-foreground sm:text-3xl"
    >
      {value.toString().padStart(2, "0")}
    </div>
    <div
      aria-hidden="true"
      className="text-[10px] uppercase tracking-wide text-muted-foreground"
    >
      {label}
    </div>
  </div>
);

const Separator = () => (
  <div
    aria-hidden="true"
    className="flex items-center text-2xl font-bold text-muted-foreground"
  >
    :
  </div>
);

const computeTimeLeft = (target) => {
  const difference = target - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    done: false,
  };
};

const CountdownTimer = ({ targetDate = APPLICATION_DEADLINE, className = "" }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
  });
  const timerRef = useRef(null);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const next = computeTimeLeft(target);
      setTimeLeft(next);
      // Once we reach zero there is nothing left to count down, so stop the
      // interval instead of re-rendering the whole tree every second forever.
      if (next.done && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick();
    if (!Number.isNaN(target) && target - Date.now() > 0) {
      timerRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [targetDate]);

  const politeLabel = timeLeft.done
    ? "Applications are closed."
    : `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes remaining.`;

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <div className="flex gap-3">
        <TimeUnit value={timeLeft.days} label="Days" />
        <Separator />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
      {/* Polite, low-frequency announcement for screen readers instead of a
          per-second firehose. */}
      <span className="sr-only" aria-live="polite">
        {politeLabel}
      </span>
    </div>
  );
};

export default CountdownTimer;
