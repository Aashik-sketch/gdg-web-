"use client";
import React, { useState, useEffect, useRef } from "react";
import { APPLICATION_DEADLINE } from "@/lib/config";
import { Badge } from "@/components/ui/badge";

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
      className="flex h-12 min-w-[3rem] items-center justify-center rounded-lg border border-border bg-muted/60 px-2 font-display text-2xl font-bold tabular-nums tracking-wider text-foreground sm:h-14 sm:min-w-[3.5rem] sm:text-3xl"
    >
      {value.toString().padStart(2, "0")}
    </div>
    <div
      aria-hidden="true"
      className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
    >
      {label}
    </div>
  </div>
);

const Separator = () => (
  <div
    aria-hidden="true"
    className="flex h-12 items-center text-xl font-bold text-muted-foreground/50 sm:h-14"
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

  // Under one day left (but not yet closed) warrants a visible urgency cue --
  // conveyed with an icon-free text badge, not colour alone.
  const isUrgent = !timeLeft.done && timeLeft.days === 0;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <TimeUnit value={timeLeft.days} label="Days" />
        <Separator />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>

      {isUrgent && (
        <Badge variant="softWarning" size="sm" className="mt-3" dot>
          Closing soon
        </Badge>
      )}

      {/* Polite, low-frequency announcement for screen readers instead of a
          per-second firehose. */}
      <span className="sr-only" aria-live="polite">
        {politeLabel}
      </span>
    </div>
  );
};

export default CountdownTimer;
