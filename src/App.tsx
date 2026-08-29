/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  Volume2, 
  VolumeX, 
  Trash2, 
  X, 
  ArrowLeftRight, 
  Calculator, 
  Binary, 
  Scale, 
  Undo2 
} from "lucide-react";

// Types & Interfaces
interface HistoryItem {
  id: string;
  equation: string;
  result: string;
  timestamp: string;
}

interface UnitType {
  name: string;
  faName: string;
  units: { name: string; faName: string; ratio: number; offset?: number }[];
}

const categories: UnitType[] = [
  {
    name: "Length",
    faName: "طول",
    units: [
      { name: "Meter (m)", faName: "متر", ratio: 1 },
      { name: "Kilometer (km)", faName: "کیلومتر", ratio: 1000 },
      { name: "Centimeter (cm)", faName: "سانتی‌متر", ratio: 0.01 },
      { name: "Millimeter (mm)", faName: "میلی‌متر", ratio: 0.001 },
      { name: "Micrometer (µm)", faName: "میکرومتر", ratio: 0.000001 },
      { name: "Nanometer (nm)", faName: "نانومتر", ratio: 0.000000001 },
      { name: "Mile (mi)", faName: "مایل", ratio: 1609.344 },
      { name: "Yard (yd)", faName: "یارد", ratio: 0.9144 },
      { name: "Foot (ft)", faName: "فوت", ratio: 0.3048 },
      { name: "Inch (in)", faName: "اینچ", ratio: 0.0254 },
      { name: "Light-year (ly)", faName: "سال نوری", ratio: 9.46073e15 },
    ]
  },
  {
    name: "Weight",
    faName: "وزن / جرم",
    units: [
      { name: "Kilogram (kg)", faName: "کیلوگرم", ratio: 1000 },
      { name: "Gram (g)", faName: "گرم", ratio: 1 },
      { name: "Milligram (mg)", faName: "میلی‌گرم", ratio: 0.001 },
      { name: "Pound (lb)", faName: "پوند", ratio: 453.59237 },
      { name: "Ounce (oz)", faName: "اونس", ratio: 28.349523 },
      { name: "Ton (t)", faName: "تن", ratio: 1000000 },
      { name: "Mesghal", faName: "مثقال", ratio: 4.6083 },
      { name: "Carat (ct)", faName: "قیراط", ratio: 0.2 },
    ]
  },
  {
    name: "Temperature",
    faName: "دما",
    units: [
      { name: "Celsius (°C)", faName: "سلسیوس", ratio: 1, offset: 0 },
      { name: "Fahrenheit (°F)", faName: "فارنهایت", ratio: 0.55555, offset: -32 },
      { name: "Kelvin (K)", faName: "کلوین", ratio: 1, offset: -273.15 },
      { name: "Rankine (°R)", faName: "رانکین", ratio: 0.55555, offset: -491.67 },
    ]
  },
  {
    name: "Area",
    faName: "مساحت",
    units: [
      { name: "Square Meter (m²)", faName: "متر مربع", ratio: 1 },
      { name: "Hectare (ha)", faName: "هکتار", ratio: 10000 },
      { name: "Acre (ac)", faName: "جریب", ratio: 4046.856 },
      { name: "Square Kilometer (km²)", faName: "کیلومتر مربع", ratio: 1000000 },
      { name: "Square Centimeter (cm²)", faName: "سانتی‌متر مربع", ratio: 0.0001 },
      { name: "Square Millimeter (mm²)", faName: "میلی‌متر مربع", ratio: 0.000001 },
      { name: "Square Foot (ft²)", faName: "فوت مربع", ratio: 0.092903 },
      { name: "Square Inch (in²)", faName: "اینچ مربع", ratio: 0.00064516 },
    ]
  },
  {
    name: "Volume",
    faName: "حجم",
    units: [
      { name: "Liter (L)", faName: "لیتر", ratio: 1 },
      { name: "Milliliter (mL)", faName: "میلی‌لیتر", ratio: 0.001 },
      { name: "Cubic Meter (m³)", faName: "متر مکعب", ratio: 1000 },
      { name: "US Gallon (gal)", faName: "گالن آمریکا", ratio: 3.78541 },
      { name: "Cup", faName: "فنجان", ratio: 0.24 },
      { name: "Tablespoon (tbsp)", faName: "قاشق غذاخوری", ratio: 0.015 },
      { name: "Cubic Centimeter (cc)", faName: "سی‌سی", ratio: 0.001 },
    ]
  },
  {
    name: "Speed",
    faName: "سرعت",
    units: [
      { name: "Meter per Second (m/s)", faName: "متر بر ثانیه", ratio: 1 },
      { name: "Kilometer per Hour (km/h)", faName: "کیلومتر بر ساعت", ratio: 0.277778 },
      { name: "Mile per Hour (mph)", faName: "مایل بر ساعت", ratio: 0.44704 },
      { name: "Knot (kt)", faName: "گره دریایی", ratio: 0.514444 },
      { name: "Mach", faName: "ماخ (سرعت صوت)", ratio: 340.29 },
    ]
  },
  {
    name: "Energy",
    faName: "انرژی",
    units: [
      { name: "Joule (J)", faName: "ژول", ratio: 1 },
      { name: "Kilojoule (kJ)", faName: "کیلوژول", ratio: 1000 },
      { name: "Calorie (cal)", faName: "کالری", ratio: 4.184 },
      { name: "Kilocalorie (kcal)", faName: "کیلوکالری", ratio: 4184 },
      { name: "Watt-hour (Wh)", faName: "وات‌ساعت", ratio: 3600 },
      { name: "Kilowatt-hour (kWh)", faName: "کیلووات‌ساعت", ratio: 3600000 },
      { name: "Electronvolt (eV)", faName: "الکترون‌ولت", ratio: 1.602176634e-19 },
    ]
  },
  {
    name: "Pressure",
    faName: "فشار",
    units: [
      { name: "Pascal (Pa)", faName: "پاسکال", ratio: 1 },
      { name: "Kilopascal (kPa)", faName: "کیلوپاسکال", ratio: 1000 },
      { name: "Bar", faName: "بار", ratio: 100000 },
      { name: "Atmosphere (atm)", faName: "اتمسفر", ratio: 101325 },
      { name: "Torr (mmHg)", faName: "میلی‌متر جیوه (تور)", ratio: 133.322 },
      { name: "PSI (lb/in²)", faName: "پوند بر اینچ مربع", ratio: 6894.76 },
    ]
  },
  {
    name: "Time",
    faName: "زمان",
    units: [
      { name: "Second (s)", faName: "ثانیه", ratio: 1 },
      { name: "Millisecond (ms)", faName: "میلی‌ثانیه", ratio: 0.001 },
      { name: "Minute (min)", faName: "دقیقه", ratio: 60 },
      { name: "Hour (h)", faName: "ساعت", ratio: 3600 },
      { name: "Day (d)", faName: "شبانه‌روز", ratio: 86400 },
      { name: "Week (wk)", faName: "هفته", ratio: 604800 },
      { name: "Year (yr)", faName: "سال", ratio: 31536000 },
    ]
  },
  {
    name: "Data Storage",
    faName: "ذخیره‌سازی داده",
    units: [
      { name: "Bit (b)", faName: "بیت", ratio: 1 },
      { name: "Byte (B)", faName: "بایت", ratio: 8 },
      { name: "Kilobyte (KB)", faName: "کیلوبایت", ratio: 8192 },
      { name: "Megabyte (MB)", faName: "مگابایت", ratio: 8388608 },
      { name: "Gigabyte (GB)", faName: "گیگابایت", ratio: 8589934592 },
      { name: "Terabyte (TB)", faName: "ترابایت", ratio: 8796093022208 },
    ]
  }
];

export default function App() {
  // State variables
  const [display, setDisplay] = useState<string>("0");
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [isResetOnNextInput, setIsResetOnNextInput] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("undo_calc_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<"fa" | "en">(() => {
    try {
      const saved = localStorage.getItem("undo_calc_lang");
      return saved === "fa" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  // App Modes
  const [calcMode, setCalcMode] = useState<"simple" | "scientific" | "converter">("simple");
  const [isRad, setIsRad] = useState<boolean>(true);

  // Unit Converter State
  const [converterCategory, setConverterCategory] = useState<number>(0);
  const [convertFromVal, setConvertFromVal] = useState<string>("1");
  const [convertFromUnit, setConvertFromUnit] = useState<number>(0);
  const [convertToUnit, setConvertToUnit] = useState<number>(1);
  const [convertToVal, setConvertToVal] = useState<string>("");

  // Swipe gesture variables
  const swipeStartX = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("undo_calc_history", JSON.stringify(history));
  }, [history]);

  // Save language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("undo_calc_lang", language);
    } catch {}
  }, [language]);

  // Lazy-initialize Web Audio Context for haptic click
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio Context failed to play sound:", e);
    }
  };

  // Safe arithmetic operation formatter
  const formatResult = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) {
      return language === "fa" ? "خطا" : "Error";
    }
    // Handle very large/small numbers with scientific notation
    if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6)) {
      return num.toExponential(6);
    }
    
    // Prevent floating point errors
    const fixedPrecision = parseFloat(num.toFixed(10));
    return fixedPrecision.toString();
  };

  // Format string for displaying thousands separators
  const formatDisplayString = (str: string): string => {
    if (str === "Error" || str === "خطا") return str;
    
    if (str.includes("e")) {
      return str;
    }

    const parts = str.split(".");
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : null;

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let result = formattedInteger;
    if (parts.length > 1) {
      result += "." + decimalPart;
    } else if (str.endsWith(".")) {
      result += ".";
    }

    if (language === "fa") {
      return result.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
    }

    return result;
  };

  // Core Calculator Handlers
  const handleDigit = (digit: string) => {
    playClickSound();
    if (display === "Error" || display === "خطا") {
      setDisplay(digit);
      setIsResetOnNextInput(false);
      return;
    }

    if (isResetOnNextInput || display === "0") {
      setDisplay(digit);
      setIsResetOnNextInput(false);
    } else {
      const cleanLength = display.replace(/[.-]/g, "").length;
      if (cleanLength < 16) { // Expanded length limit for high precision calculations
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    playClickSound();
    if (isResetOnNextInput || display === "Error" || display === "خطا") {
      setDisplay("0.");
      setIsResetOnNextInput(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    playClickSound();
    if (display !== "0") {
      setDisplay("0");
    } else {
      setPrevValue(null);
      setOperation(null);
      setIsResetOnNextInput(false);
    }
  };

  const handleToggleSign = () => {
    playClickSound();
    if (display === "0" || display === "Error" || display === "خطا") return;

    if (display.startsWith("-")) {
      setDisplay(display.slice(1));
    } else {
      setDisplay("-" + display);
    }
  };

  const handlePercent = () => {
    playClickSound();
    if (display === "Error" || display === "خطا") return;
    const value = parseFloat(display) / 100;
    setDisplay(formatResult(value));
    setIsResetOnNextInput(true);
  };

  const handleOperator = (op: string) => {
    playClickSound();
    if (display === "Error" || display === "خطا") return;

    if (operation && prevValue !== null && !isResetOnNextInput) {
      const current = parseFloat(display);
      const prev = parseFloat(prevValue);
      let result = 0;

      switch (operation) {
        case "+": result = prev + current; break;
        case "-": result = prev - current; break;
        case "×": result = prev * current; break;
        case "÷": result = current !== 0 ? prev / current : NaN; break;
        case "^": result = Math.pow(prev, current); break;
        case "mod": result = prev % current; break;
      }

      const formattedResult = formatResult(result);
      setDisplay(formattedResult);
      setPrevValue(formattedResult);
    } else {
      setPrevValue(display);
    }

    setOperation(op);
    setIsResetOnNextInput(true);
  };

  const handleEqual = () => {
    playClickSound();
    if (!operation || prevValue === null || display === "Error" || display === "خطا") return;

    const current = parseFloat(display);
    const prev = parseFloat(prevValue);
    let result = 0;

    switch (operation) {
      case "+": result = prev + current; break;
      case "-": result = prev - current; break;
      case "×": result = prev * current; break;
      case "÷": result = current !== 0 ? prev / current : NaN; break;
      case "^": result = Math.pow(prev, current); break;
      case "mod": result = prev % current; break;
    }

    const formattedResult = formatResult(result);
    
    // Add to history
    const opSign = operation;
    const equationStr = `${formatDisplayString(prevValue)} ${opSign} ${formatDisplayString(display)}`;
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      equation: equationStr,
      result: formatDisplayString(formattedResult),
      timestamp: new Date().toLocaleTimeString(language === "fa" ? "fa-IR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    setHistory((prevHistory) => [newHistoryItem, ...prevHistory]);
    setDisplay(formattedResult);
    setPrevValue(null);
    setOperation(null);
    setIsResetOnNextInput(true);
  };

  // Factorial utility
  const getFactorial = (num: number): number => {
    if (num < 0 || !Number.isInteger(num)) return NaN;
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= Math.min(num, 170); i++) {
      result *= i;
    }
    return num > 170 ? Infinity : result;
  };

  // Scientific actions
  const handleScientificAction = (id: string) => {
    playClickSound();
    if (display === "Error" || display === "خطا") return;

    const current = parseFloat(display);

    switch (id) {
      case "rad":
        setIsRad(!isRad);
        break;
      case "sin": {
        const radVal = isRad ? current : (current * Math.PI) / 180;
        setDisplay(formatResult(Math.sin(radVal)));
        setIsResetOnNextInput(true);
        break;
      }
      case "cos": {
        const radVal = isRad ? current : (current * Math.PI) / 180;
        setDisplay(formatResult(Math.cos(radVal)));
        setIsResetOnNextInput(true);
        break;
      }
      case "tan": {
        const radVal = isRad ? current : (current * Math.PI) / 180;
        setDisplay(formatResult(Math.tan(radVal)));
        setIsResetOnNextInput(true);
        break;
      }
      case "asin": {
        const res = Math.asin(current);
        const val = isRad ? res : (res * 180) / Math.PI;
        setDisplay(formatResult(val));
        setIsResetOnNextInput(true);
        break;
      }
      case "acos": {
        const res = Math.acos(current);
        const val = isRad ? res : (res * 180) / Math.PI;
        setDisplay(formatResult(val));
        setIsResetOnNextInput(true);
        break;
      }
      case "atan": {
        const res = Math.atan(current);
        const val = isRad ? res : (res * 180) / Math.PI;
        setDisplay(formatResult(val));
        setIsResetOnNextInput(true);
        break;
      }
      case "sinh":
        setDisplay(formatResult(Math.sinh(current)));
        setIsResetOnNextInput(true);
        break;
      case "cosh":
        setDisplay(formatResult(Math.cosh(current)));
        setIsResetOnNextInput(true);
        break;
      case "tanh":
        setDisplay(formatResult(Math.tanh(current)));
        setIsResetOnNextInput(true);
        break;
      case "inv":
        if (current === 0) {
          setDisplay(language === "fa" ? "خطا" : "Error");
        } else {
          setDisplay(formatResult(1 / current));
        }
        setIsResetOnNextInput(true);
        break;
      case "ln":
        if (current <= 0) {
          setDisplay(language === "fa" ? "خطا" : "Error");
        } else {
          setDisplay(formatResult(Math.log(current)));
        }
        setIsResetOnNextInput(true);
        break;
      case "log":
        if (current <= 0) {
          setDisplay(language === "fa" ? "خطا" : "Error");
        } else {
          setDisplay(formatResult(Math.log10(current)));
        }
        setIsResetOnNextInput(true);
        break;
      case "log2":
        if (current <= 0) {
          setDisplay(language === "fa" ? "خطا" : "Error");
        } else {
          setDisplay(formatResult(Math.log2(current)));
        }
        setIsResetOnNextInput(true);
        break;
      case "x2":
        setDisplay(formatResult(Math.pow(current, 2)));
        setIsResetOnNextInput(true);
        break;
      case "x3":
        setDisplay(formatResult(Math.pow(current, 3)));
        setIsResetOnNextInput(true);
        break;
      case "ex":
        setDisplay(formatResult(Math.exp(current)));
        setIsResetOnNextInput(true);
        break;
      case "pow10":
        setDisplay(formatResult(Math.pow(10, current)));
        setIsResetOnNextInput(true);
        break;
      case "pow2":
        setDisplay(formatResult(Math.pow(2, current)));
        setIsResetOnNextInput(true);
        break;
      case "sqrt":
        if (current < 0) {
          setDisplay(language === "fa" ? "خطا" : "Error");
        } else {
          setDisplay(formatResult(Math.sqrt(current)));
        }
        setIsResetOnNextInput(true);
        break;
      case "cbrt":
        setDisplay(formatResult(Math.cbrt(current)));
        setIsResetOnNextInput(true);
        break;
      case "abs":
        setDisplay(formatResult(Math.abs(current)));
        setIsResetOnNextInput(true);
        break;
      case "fact":
        if (current < 0 || !Number.isInteger(current)) {
          setDisplay(language === "fa" ? "خطا" : "Error");
        } else {
          setDisplay(formatResult(getFactorial(current)));
        }
        setIsResetOnNextInput(true);
        break;
      case "pi":
        setDisplay(Math.PI.toString());
        setIsResetOnNextInput(false);
        break;
      case "e":
        setDisplay(Math.E.toString());
        setIsResetOnNextInput(false);
        break;
      case "rand":
        setDisplay(formatResult(Math.random()));
        setIsResetOnNextInput(true);
        break;
      case "xy":
        setPrevValue(display);
        setOperation("^");
        setIsResetOnNextInput(true);
        break;
      case "mod_op":
        setPrevValue(display);
        setOperation("mod");
        setIsResetOnNextInput(true);
        break;
    }
  };

  // Swipe left/right on display to delete last character (iconic iOS swipe)
  const handlePointerDown = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const deltaX = e.clientX - swipeStartX.current;
    
    if (Math.abs(deltaX) > 50) {
      playClickSound();
      if (display !== "0" && display !== "Error" && display !== "خطا") {
        if (display.length > 1) {
          if (display.length === 2 && display.startsWith("-")) {
            setDisplay("0");
          } else {
            setDisplay(display.slice(0, -1));
          }
        } else {
          setDisplay("0");
        }
      }
    }
    swipeStartX.current = null;
  };

  // Keyboard mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleDigit(key);
        triggerKeyFlash(key);
      } else if (key === ".") {
        e.preventDefault();
        handleDecimal();
        triggerKeyFlash(".");
      } else if (key === "+") {
        e.preventDefault();
        handleOperator("+");
        triggerKeyFlash("+");
      } else if (key === "-") {
        e.preventDefault();
        handleOperator("-");
        triggerKeyFlash("-");
      } else if (key === "*") {
        e.preventDefault();
        handleOperator("×");
        triggerKeyFlash("×");
      } else if (key === "/") {
        e.preventDefault();
        handleOperator("÷");
        triggerKeyFlash("÷");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEqual();
        triggerKeyFlash("=");
      } else if (key === "Backspace") {
        e.preventDefault();
        if (display !== "0" && display !== "Error" && display !== "خطا") {
          playClickSound();
          if (display.length > 1) {
            if (display.length === 2 && display.startsWith("-")) {
              setDisplay("0");
            } else {
              setDisplay(display.slice(0, -1));
            }
          } else {
            setDisplay("0");
          }
        }
      } else if (key === "Escape") {
        e.preventDefault();
        handleClear();
        triggerKeyFlash("AC");
      } else if (key === "%") {
        e.preventDefault();
        handlePercent();
        triggerKeyFlash("%");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [display, prevValue, operation, isResetOnNextInput, language, soundEnabled]);

  const triggerKeyFlash = (key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 100);
  };

  // Dynamic Text Sizing for Display
  const getFontSizeClass = (text: string) => {
    const len = text.length;
    if (len <= 7) return "text-5xl sm:text-6xl md:text-7xl lg:text-8xl";
    if (len <= 10) return "text-4xl sm:text-5xl md:text-6xl lg:text-7xl";
    if (len <= 13) return "text-3xl sm:text-4xl md:text-5xl lg:text-6xl";
    return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl";
  };

  // Extensive Scientific keys (Categorized beautifully)
  const mathFunctions = [
    { id: "rad", label: isRad ? "Rad / Deg" : "Deg / Rad", sub: isRad ? "Radian" : "Degree", isToggle: true },
    { id: "sin", label: "sin", sub: "Sine" },
    { id: "cos", label: "cos", sub: "Cosine" },
    { id: "tan", label: "tan", sub: "Tangent" },
    
    { id: "asin", label: "sin⁻¹", sub: "Arc Sine" },
    { id: "acos", label: "cos⁻¹", sub: "Arc Cosine" },
    { id: "atan", label: "tan⁻¹", sub: "Arc Tangent" },
    { id: "abs", label: "|x|", sub: "Absolute" },

    { id: "sinh", label: "sinh", sub: "Hyperbolic sin" },
    { id: "cosh", label: "cosh", sub: "Hyperbolic cos" },
    { id: "tanh", label: "tanh", sub: "Hyperbolic tan" },
    { id: "fact", label: "x!", sub: "Factorial" },

    { id: "x2", label: "x²", sub: "Square" },
    { id: "x3", label: "x³", sub: "Cube" },
    { id: "xy", label: "xʸ", sub: "Power of Y" },
    { id: "ex", label: "eˣ", sub: "Exponential" },

    { id: "pow10", label: "10ˣ", sub: "Power of 10" },
    { id: "pow2", label: "2ˣ", sub: "Power of 2" },
    { id: "sqrt", label: "√x", sub: "Square Root" },
    { id: "cbrt", label: "∛x", sub: "Cube Root" },

    { id: "ln", label: "ln", sub: "Natural Log" },
    { id: "log", label: "log₁₀", sub: "Log base 10" },
    { id: "log2", label: "log₂", sub: "Log base 2" },
    { id: "inv", label: "1/x", sub: "Reciprocal" },

    { id: "pi", label: "π", sub: "Pi constant" },
    { id: "e", label: "e", sub: "Euler constant" },
    { id: "rand", label: "Rand", sub: "Random 0-1" },
    { id: "mod_op", label: "mod", sub: "Modulo remainder" }
  ];

  // Run Unit conversion logic on change
  useEffect(() => {
    if (calcMode !== "converter") return;
    const cat = categories[converterCategory];
    if (!cat) return;
    const fromUnitObj = cat.units[convertFromUnit];
    const toUnitObj = cat.units[convertToUnit];
    if (!fromUnitObj || !toUnitObj) return;
    
    const num = parseFloat(convertFromVal);
    if (isNaN(num)) {
      setConvertToVal("");
      return;
    }

    let baseValue = num;
    // Handle temperature offsets
    if (cat.name === "Temperature") {
      // First convert from current unit to Celsius (base)
      const offsetFrom = fromUnitObj.offset || 0;
      if (fromUnitObj.name.startsWith("Fahrenheit")) {
        baseValue = (num - 32) * (5/9);
      } else if (fromUnitObj.name.startsWith("Kelvin")) {
        baseValue = num + offsetFrom;
      } else if (fromUnitObj.name.startsWith("Rankine")) {
        baseValue = (num - 491.67) * (5/9);
      } else {
        baseValue = num;
      }

      // Convert Celsius to target unit
      let finalVal = baseValue;
      if (toUnitObj.name.startsWith("Fahrenheit")) {
        finalVal = (baseValue * 9/5) + 32;
      } else if (toUnitObj.name.startsWith("Kelvin")) {
        finalVal = baseValue - (toUnitObj.offset || 0);
      } else if (toUnitObj.name.startsWith("Rankine")) {
        finalVal = (baseValue * 9/5) + 491.67;
      }
      setConvertToVal(finalVal.toFixed(4).replace(/\.?0+$/, ""));
    } else {
      // Standard conversion via ratio
      baseValue = num * fromUnitObj.ratio;
      const finalVal = baseValue / toUnitObj.ratio;
      setConvertToVal(finalVal.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    }
  }, [convertFromVal, convertFromUnit, convertToUnit, converterCategory, calcMode]);

  return (
    <div 
      dir={language === "fa" ? "rtl" : "ltr"}
      className="min-h-screen w-full max-w-full bg-radial from-neutral-900 to-neutral-950 text-white flex flex-col justify-between items-center px-3 py-4 sm:p-6 md:p-8 font-sans select-none overflow-x-hidden relative"
    >
      
      {/* Dynamic Glow Accents inside an overflow-hidden wrapper */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-72 md:w-96 h-72 md:h-96 bg-cyan-500/5 rounded-full blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-72 md:w-96 h-72 md:h-96 bg-orange-500/5 rounded-full blur-[100px] md:blur-[120px]" />
      </div>

      {/* Branded Header: UNDO Engineering Group */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center py-3 md:py-4 border-b border-neutral-800/80 z-10 gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/icon-192.jpg" 
            alt="Undo Calc Icon" 
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover shadow-lg shadow-orange-500/20 border border-orange-500/30"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-start">
            <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Undo Calc Engine
            </h1>
            <span className="text-[9px] md:text-[10px] tracking-widest text-neutral-400 font-mono font-medium">
              {language === "fa" ? "محاسبه‌گر پیشرفته مهندسی" : "ADVANCED SCIENTIFIC ENGINE"}
            </span>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* History drawer button */}
          <button
            id="history-btn"
            onClick={() => { playClickSound(); setIsHistoryOpen(true); }}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 flex justify-center items-center transition duration-150 active:scale-95 cursor-pointer border border-neutral-800"
            title={language === "fa" ? "تاریخچه محاسبات" : "Calculation History"}
          >
            <History size={17} />
          </button>

          {/* Language translation switcher */}
          <button
            id="lang-btn"
            onClick={() => { playClickSound(); setLanguage(l => l === "fa" ? "en" : "fa"); }}
            className="px-3 h-9 md:h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer border border-neutral-800"
          >
            <ArrowLeftRight size={12} className="text-orange-500" />
            <span>{language === "fa" ? "English" : "فارسی"}</span>
          </button>

          {/* Haptic / Click Sound feedback system */}
          <button
            id="sound-btn"
            onClick={() => { setSoundEnabled(!soundEnabled); setTimeout(playClickSound, 50); }}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex justify-center items-center transition duration-150 active:scale-95 cursor-pointer border ${soundEnabled ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20" : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800"}`}
            title={language === "fa" ? "صدا" : "Sound"}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="w-full flex-1 flex flex-col justify-center py-4 md:py-8 z-10">
        
        {/* Navigation Tabs for modes */}
        <div className="flex justify-center p-1 bg-neutral-900/95 rounded-2xl w-full max-w-xs sm:max-w-md mx-auto mb-4 md:mb-6 border border-neutral-800 shadow-xl gap-0.5">
          <button
            onClick={() => { playClickSound(); setCalcMode("simple"); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all relative cursor-pointer ${
              calcMode === "simple" ? "text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {calcMode === "simple" && (
              <motion.div
                layoutId="activeTabSelector"
                className="absolute inset-0 bg-white rounded-lg shadow-md"
                style={{ zIndex: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex justify-center items-center gap-1">
              <Calculator size={13} />
              {language === "fa" ? "ساده" : "Simple"}
            </span>
          </button>

          <button
            onClick={() => { playClickSound(); setCalcMode("scientific"); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all relative cursor-pointer ${
              calcMode === "scientific" ? "text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {calcMode === "scientific" && (
              <motion.div
                layoutId="activeTabSelector"
                className="absolute inset-0 bg-white rounded-lg shadow-md"
                style={{ zIndex: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex justify-center items-center gap-1">
              <Binary size={13} />
              {language === "fa" ? "مهندسی" : "Scientific"}
            </span>
          </button>

          <button
            onClick={() => { playClickSound(); setCalcMode("converter"); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all relative cursor-pointer ${
              calcMode === "converter" ? "text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {calcMode === "converter" && (
              <motion.div
                layoutId="activeTabSelector"
                className="absolute inset-0 bg-white rounded-lg shadow-md"
                style={{ zIndex: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex justify-center items-center gap-1">
              <Scale size={13} />
              {language === "fa" ? "تبدیل واحد" : "Converter"}
            </span>
          </button>
        </div>

        <div 
          className={`w-full mx-auto bg-neutral-900/60 border border-neutral-800 shadow-2xl p-4 sm:p-6 md:p-8 rounded-3xl md:rounded-[32px] flex flex-col transition-all duration-300 ease-in-out ${
            calcMode === "simple" ? "max-w-md" : "max-w-5xl"
          }`}
        >
          {/* Conditionally render Calculator, Converter or Tools Panel */}
          {(calcMode === "simple" || calcMode === "scientific") ? (
            <>
              {/* DISPLAY COMPONENT (PINNED TO TOP ON SCROLL) */}
              <div 
                className="w-full flex flex-col justify-end items-end px-4 sm:px-5 py-4 sm:py-5 md:py-7 min-h-[115px] sm:min-h-[130px] md:min-h-[150px] cursor-ew-resize relative rounded-2xl bg-neutral-950/95 backdrop-blur-xl mb-4 sm:mb-6 border border-neutral-800/90 shadow-2xl sticky top-2 md:top-4 z-20 touch-pan-y overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                title={language === "fa" ? "برای پاک کردن رقم آخر به چپ یا راست بکشید" : "Swipe left/right to delete last digit"}
              >
                {/* Indicators & Labels */}
                <div className={`absolute top-3 sm:top-4 ${language === "fa" ? "right-3 sm:right-4" : "left-3 sm:left-4"} flex gap-1.5 sm:gap-2 items-center`}>
                  {calcMode === "scientific" && (
                    <span className="text-[9px] sm:text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase">
                      {isRad ? (language === "fa" ? "رادیان" : "Rad") : (language === "fa" ? "درجه" : "Deg")}
                    </span>
                  )}
                  {operation && (
                    <span className="text-[9px] sm:text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-orange-950/40 text-orange-400 border border-orange-900/30">
                      {operation}
                    </span>
                  )}
                </div>

                {/* Active ongoing formula / memory display */}
                <div className="h-5 sm:h-6 text-neutral-500 text-right font-medium text-xs sm:text-sm w-full select-none pr-1 mb-1 truncate">
                  {prevValue && (
                    <span className="animate-fade-in font-mono">
                      {formatDisplayString(prevValue)} {operation}
                    </span>
                  )}
                </div>

                {/* Main numeric display value */}
                <div className="w-full text-right select-all overflow-hidden">
                  <span 
                    className={`font-light transition-all duration-150 tracking-tight leading-none inline-block font-mono break-all ${getFontSizeClass(display)}`}
                  >
                    {formatDisplayString(display)}
                  </span>
                </div>
                
                {/* Swipe helper banner */}
                {display !== "0" && display.length <= 4 && (
                  <div className={`absolute ${language === "fa" ? "left-4" : "right-4"} bottom-1 text-[8px] sm:text-[9px] text-neutral-600 animate-pulse pointer-events-none hidden sm:block`}>
                    {language === "fa" ? "← پاک کردن با کشیدن انگشت (Swipe)" : "← swipe on screen to delete last digit"}
                  </div>
                )}
              </div>

              {/* KEYPAD LAYOUT */}
              <div className="w-full flex flex-col lg:flex-row gap-4 sm:gap-6">
                
                {/* Extensive scientific buttons (Visible only in "scientific" mode) */}
                <AnimatePresence mode="wait">
                  {calcMode === "scientific" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className={`w-full lg:w-[50%] grid grid-cols-4 gap-2 sm:gap-3 ${
                        language === "fa" ? "lg:border-l lg:pl-6" : "lg:border-r lg:pr-6"
                      } border-neutral-800/40`}
                      id="scientific-keyboard"
                    >
                      {mathFunctions.map((func) => {
                        const isRadBtn = func.id === "rad";
                        return (
                          <button
                            key={func.id}
                            onClick={() => handleScientificAction(func.id)}
                            className={`h-12 sm:h-14 rounded-xl flex flex-col justify-center items-center text-xs transition duration-150 relative overflow-hidden group cursor-pointer active:scale-95 ${
                              isRadBtn && !isRad
                                ? "bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/30"
                                : isRadBtn
                                ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700/50"
                                : "bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-800/50"
                            }`}
                            title={func.sub}
                          >
                            <span className="font-semibold text-xs sm:text-sm">{func.label}</span>
                            <span className="text-[7px] sm:text-[8px] text-neutral-500 uppercase mt-0.5 scale-90 group-hover:text-neutral-400">
                              {func.id === "rad" ? (isRad ? "Rad" : "Deg") : func.id}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Numeric and Basic Arithmetic Grid */}
                <div 
                  className={`grid grid-cols-4 gap-2 sm:gap-3 transition-all duration-300 ${
                    calcMode === "simple" ? "w-full" : "w-full lg:w-[50%]"
                  }`}
                  id="calculator-keyboard"
                >
                  {/* Row 1 */}
                  <button
                    id="btn-clear"
                    onClick={handleClear}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-sm font-semibold transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "AC" ? "bg-white text-black" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50"
                    }`}
                  >
                    {display !== "0" ? "C" : "AC"}
                  </button>
                  
                  <button
                    id="btn-sign"
                    onClick={handleToggleSign}
                    className="h-12 sm:h-14 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50 flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 active:scale-95 cursor-pointer"
                  >
                    ⁺∕₋
                  </button>
                  
                  <button
                    id="btn-percent"
                    onClick={handlePercent}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-sm font-semibold transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "%" ? "bg-white text-black" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50"
                    }`}
                  >
                    %
                  </button>
                  
                  <button
                    id="btn-divide"
                    onClick={() => handleOperator("÷")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-lg sm:text-xl font-bold transition duration-150 cursor-pointer active:scale-95 ${
                      operation === "÷" 
                        ? "bg-white text-[#ff9f0a]" 
                        : activeKey === "÷" 
                        ? "bg-neutral-700 text-[#ff9f0a]" 
                        : "bg-[#ff9f0a] hover:bg-[#ffb03a] text-white"
                    }`}
                  >
                    ÷
                  </button>

                  {/* Row 2 */}
                  <button
                    id="btn-7"
                    onClick={() => handleDigit("7")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "7" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۷" : "7"}
                  </button>
                  
                  <button
                    id="btn-8"
                    onClick={() => handleDigit("8")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "8" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۸" : "8"}
                  </button>
                  
                  <button
                    id="btn-9"
                    onClick={() => handleDigit("9")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "9" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۹" : "9"}
                  </button>
                  
                  <button
                    id="btn-multiply"
                    onClick={() => handleOperator("×")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-lg sm:text-xl font-bold transition duration-150 cursor-pointer active:scale-95 ${
                      operation === "×" 
                        ? "bg-white text-[#ff9f0a]" 
                        : activeKey === "×" 
                        ? "bg-neutral-700 text-[#ff9f0a]" 
                        : "bg-[#ff9f0a] hover:bg-[#ffb03a] text-white"
                    }`}
                  >
                    ×
                  </button>

                  {/* Row 3 */}
                  <button
                    id="btn-4"
                    onClick={() => handleDigit("4")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "4" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۴" : "4"}
                  </button>
                  
                  <button
                    id="btn-5"
                    onClick={() => handleDigit("5")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "5" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۵" : "5"}
                  </button>
                  
                  <button
                    id="btn-6"
                    onClick={() => handleDigit("6")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "6" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۶" : "6"}
                  </button>
                  
                  <button
                    id="btn-minus"
                    onClick={() => handleOperator("-")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-lg sm:text-xl font-bold transition duration-150 cursor-pointer active:scale-95 ${
                      operation === "-" 
                        ? "bg-white text-[#ff9f0a]" 
                        : activeKey === "-" 
                        ? "bg-neutral-700 text-[#ff9f0a]" 
                        : "bg-[#ff9f0a] hover:bg-[#ffb03a] text-white"
                    }`}
                  >
                    -
                  </button>

                  {/* Row 4 */}
                  <button
                    id="btn-1"
                    onClick={() => handleDigit("1")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "1" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۱" : "1"}
                  </button>
                  
                  <button
                    id="btn-2"
                    onClick={() => handleDigit("2")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "2" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۲" : "2"}
                  </button>
                  
                  <button
                    id="btn-3"
                    onClick={() => handleDigit("3")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "3" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۳" : "3"}
                  </button>
                  
                  <button
                    id="btn-plus"
                    onClick={() => handleOperator("+")}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-lg sm:text-xl font-bold transition duration-150 cursor-pointer active:scale-95 ${
                      operation === "+" 
                        ? "bg-white text-[#ff9f0a]" 
                        : activeKey === "+" 
                        ? "bg-neutral-700 text-[#ff9f0a]" 
                        : "bg-[#ff9f0a] hover:bg-[#ffb03a] text-white"
                    }`}
                  >
                    +
                  </button>

                  {/* Row 5 */}
                  <button
                    id="btn-0"
                    onClick={() => handleDigit("0")}
                    className={`col-span-2 h-12 sm:h-14 rounded-xl flex items-center ${
                      language === "fa" ? "pr-4 sm:pr-6" : "pl-4 sm:pl-6"
                    } text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "0" ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "۰" : "0"}
                  </button>
                  
                  <button
                    id="btn-decimal"
                    onClick={handleDecimal}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-base sm:text-lg font-medium transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "." ? "bg-neutral-500 text-white" : "bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-800"
                    }`}
                  >
                    {language === "fa" ? "٫" : "."}
                  </button>
                  
                  <button
                    id="btn-equal"
                    onClick={handleEqual}
                    className={`h-12 sm:h-14 rounded-xl flex justify-center items-center text-xl sm:text-2xl font-bold transition duration-150 cursor-pointer active:scale-95 ${
                      activeKey === "=" ? "bg-neutral-200 text-[#ff9f0a]" : "bg-[#ff9f0a] hover:bg-[#ffb03a] text-white"
                    }`}
                  >
                    =
                  </button>
                </div>

              </div>
            </>
          ) : (
            
            /* UNIT CONVERTER COMPONENT - Beautifully integrated */
            <div className="w-full flex flex-col gap-6 animate-fade-in" id="unit-converter-panel">
              <div className="flex flex-col items-start gap-1 pb-2">
                <h2 className="text-lg font-semibold text-orange-400">
                  {language === "fa" ? "مبدل سریع واحدها" : "Smart Unit Converter"}
                </h2>
                <p className="text-xs text-neutral-400">
                  {language === "fa" ? "محاسبه دقیق نسبت‌های مهندسی توسط هسته هوشمند UNDO" : "Highly accurate engineering ratios calculated via UNDO math core"}
                </p>
              </div>

              {/* Category Segment Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      playClickSound();
                      setConverterCategory(index);
                      setConvertFromUnit(0);
                      setConvertToUnit(1);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition duration-150 cursor-pointer text-center ${
                      converterCategory === index
                        ? "bg-orange-500 text-black border-orange-500 shadow-md shadow-orange-500/10"
                        : "bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
                    }`}
                  >
                    {language === "fa" ? cat.faName : cat.name}
                  </button>
                ))}
              </div>

              {/* Double Panel converter layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                
                {/* Convert From Column */}
                <div className="p-5 rounded-2xl bg-black/40 border border-neutral-800 flex flex-col gap-4">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    {language === "fa" ? "تبدیل از" : "Convert From"}
                  </label>
                  
                  {/* From unit selector */}
                  <select
                    value={convertFromUnit}
                    onChange={(e) => { playClickSound(); setConvertFromUnit(parseInt(e.target.value)); }}
                    className="w-full bg-neutral-900 text-white rounded-xl p-3 border border-neutral-800 text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {categories[converterCategory].units.map((unit, idx) => (
                      <option key={idx} value={idx}>
                        {language === "fa" ? unit.faName : unit.name}
                      </option>
                    ))}
                  </select>

                  {/* From value input */}
                  <input
                    type="number"
                    value={convertFromVal}
                    onChange={(e) => setConvertFromVal(e.target.value)}
                    placeholder="0"
                    className="w-full bg-neutral-950 text-white text-3xl font-light rounded-xl p-4 border border-neutral-800/80 focus:outline-none focus:border-orange-500 font-mono text-right"
                  />
                </div>

                {/* Convert To Column */}
                <div className="p-5 rounded-2xl bg-black/40 border border-neutral-800 flex flex-col gap-4">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    {language === "fa" ? "تبدیل به" : "Convert To"}
                  </label>
                  
                  {/* To unit selector */}
                  <select
                    value={convertToUnit}
                    onChange={(e) => { playClickSound(); setConvertToUnit(parseInt(e.target.value)); }}
                    className="w-full bg-neutral-900 text-white rounded-xl p-3 border border-neutral-800 text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {categories[converterCategory].units.map((unit, idx) => (
                      <option key={idx} value={idx}>
                        {language === "fa" ? unit.faName : unit.name}
                      </option>
                    ))}
                  </select>

                  {/* Result value output */}
                  <div className="w-full bg-neutral-950 text-orange-400 text-3xl font-light rounded-xl p-4 border border-orange-500/10 text-right min-h-[70px] flex items-center justify-end font-mono overflow-x-auto">
                    {convertToVal || "0"}
                  </div>
                </div>

              </div>

              {/* Conversion Reference Factor hint */}
              <div className="text-center p-3 bg-neutral-900/30 rounded-xl border border-neutral-800/40 text-xs text-neutral-500">
                {language === "fa" ? "مبنای محاسبات بر اساس استانداردهای بین‌المللی یکاها (SI) می‌باشد." : "Calculations are based on International System of Units (SI) standards."}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FIXED OVERLAY - Calculation History log drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-end md:items-center p-0 md:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-2xl bg-neutral-950 rounded-t-[36px] md:rounded-[24px] border border-neutral-800 flex flex-col h-[80vh] md:h-[600px] shadow-2xl overflow-hidden"
            >
              {/* Header inside history */}
              <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-neutral-900">
                <div className="flex items-center gap-2">
                  <History className="text-orange-500" size={18} />
                  <h3 className="text-lg font-semibold tracking-tight">
                    {language === "fa" ? "تاریخچه محاسبات" : "Calculation History"}
                  </h3>
                </div>
                <button
                  id="close-history-btn"
                  onClick={() => { playClickSound(); setIsHistoryOpen(false); }}
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex justify-center items-center text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* List of history items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center text-neutral-500">
                    <History size={40} className="stroke-[1.2] mb-3 text-neutral-700" />
                    <p className="text-sm font-light">
                      {language === "fa" ? "هیچ محاسبه‌ای یافت نشد" : "No calculations logged yet"}
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        playClickSound();
                        const rawResult = item.result
                          .replace(/[٫]/g, ".")
                          .replace(/[^0-9.-]/g, "");
                        setDisplay(rawResult || "0");
                        setIsResetOnNextInput(true);
                        setIsHistoryOpen(false);
                      }}
                      className={`group p-4 bg-neutral-900/50 hover:bg-neutral-900 rounded-2xl border border-neutral-900 transition duration-150 cursor-pointer ${
                        language === "fa" ? "text-right" : "text-left"
                      } flex flex-col`}
                    >
                      <span className="text-xs text-neutral-500 font-mono mb-1 select-none">
                        {item.timestamp}
                      </span>
                      <span className="text-sm text-neutral-400 font-light truncate">
                        {item.equation}
                      </span>
                      <span className="text-2xl font-light text-orange-400 mt-1 select-all font-mono">
                        = {item.result}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Clear History Button */}
              {history.length > 0 && (
                <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex gap-3">
                  <button
                    id="clear-all-history-btn"
                    onClick={() => {
                      playClickSound();
                      setHistory([]);
                    }}
                    className="flex-1 h-12 rounded-2xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/40 text-sm font-medium flex justify-center items-center gap-2 transition active:scale-[0.99] cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span>{language === "fa" ? "حذف همه تاریخچه" : "Clear All History"}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Footer */}
      <footer className="w-full max-w-5xl text-center py-6 border-t border-neutral-800/60 text-xs text-neutral-500 font-light mt-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="leading-relaxed">
          {language === "fa" 
            ? "محاسبه‌گر حرفه‌ای و پیشرفته Undo - پردازش دقیق توابع ریاضی و فیزیک"
            : "Undo Calc Engine - High precision processing for mathematical and physics functions."}
        </p>
        <div className="flex gap-4 text-neutral-600">
          <span>v2.2.0</span>
          <span>•</span>
          <span>{language === "fa" ? "طراحی صنعتی و مدرن" : "Industrial Modern Styling"}</span>
        </div>
      </footer>

    </div>
  );
}
