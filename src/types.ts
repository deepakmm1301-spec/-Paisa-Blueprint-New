export interface LoanDetails {
  homeLoan: number;
  personalLoan: number;
  carLoan: number;
  otherLoan: number;
  homeLoanRate?: number;
  personalLoanRate?: number;
  carLoanRate?: number;
  homeLoanTenure?: number;
  personalLoanTenure?: number;
  carLoanTenure?: number;
}

export interface InvestmentDetails {
  mutualFunds: number;
  stocks: number;
  gold: number;
  epf: number;
  ppf: number;
  nps: number;
  realEstate: number;
}

export interface UserProfile {
  id?: string;
  pin?: string;
  name: string;
  age: number;
  retirementAge: number;
  salary: number; // monthly gross
  city: "tier1" | "tier2" | "tier3"; // tier 1: Metro, tier 2: Town, tier 3: Rural/Semi-urban
  maritalStatus: "single" | "married" | "dependents";
  dependentsCount: number;
  currentSavings: number; // liquid
  loans: LoanDetails;
  investments: InvestmentDetails;
  monthlyExpenses: number;
  customSip?: number;
  healthInsuranceCover?: number;
  termInsuranceCover?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SalaryStructure {
  basic: number;
  da: number;
  hra: number;
  allowances: number;
  npsPercentage: number;
  npsDeduction: number;
  pfDeduction: number;
  gross: number;
  inHand: number;
  taxDeducted: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  yearsLeft: number;
  expectedReturn: number;
  inflationRate: number;
  category: "education" | "marriage" | "house" | "car" | "vacation" | "other";
}

export function getShareableLink(widget?: string, pathName?: string): string {
  try {
    let href = typeof window !== "undefined" ? window.location.href : "";
    let base = "https://paisablueprint.in"; // Fallback production custom domain
    
    if (href && href.startsWith("http")) {
      if (href.includes("ais-dev-")) {
        href = href.replace("ais-dev-", "ais-pre-");
      }
      
      const isDevDomain = href.includes("localhost") || 
                          href.includes("127.0.0.1") || 
                          href.includes("about:") || 
                          href.includes("googleusercontent.com");
                          
      if (!isDevDomain) {
        base = window.location.origin;
      } else {
        try {
          const urlObj = new URL(href);
          if (urlObj.hostname.includes("run.app") || urlObj.hostname.includes("localhost") || urlObj.hostname.includes("127.0.0.1")) {
            base = `${urlObj.protocol}//${urlObj.hostname}`;
            if (urlObj.port) {
              base += `:${urlObj.port}`;
            }
          }
        } catch (_) {}
      }
    }

    if (pathName) {
      const cleanPath = pathName.startsWith("/") ? pathName : `/${pathName}`;
      return `${base}${cleanPath}`;
    }

    if (widget) {
      const WIDGET_PATH_MAP: Record<string, string> = {
        bpsc_salary: "/",
        bihar_da: "/da-calculator",
        govt_sip: "/government-employee-sip-calculator",
        nps_govt: "/nps-calculator",
        eight_pay_calc: "/8th-pay-commission-salary-calculator",
        eight_pay_fitment: "/8th-pay-fitment-factor-calculator",
        eight_pay_hike: "/8th-pay-salary-hike-calculator",
        eight_pay_pension: "/8th-pay-pension-calculator",
        eight_pay_news: "/8th-pay-commission-latest-news",
        eight_pay_fitment_info: "/8th-pay-commission-fitment-factor",
        eight_pay_chart: "/8th-pay-commission-salary-chart",
        eight_pay_date: "/8th-pay-commission-date",
        eight_pay_teachers: "/8th-pay-commission-for-teachers",
        salary: "/salary-calculator",
        pension: "/pension-calculator",
        sip: "/sip-calculator",
        retirement: "/retirement-roadmap",
        goals: "/my-goal-planner",
        tax: "/tax-regime-optimizer",
        networth: "/my-wealth-tracker",
        cibil: "/cibil-credit-card",
        debt: "/debt-freedom-planner",
        coach: "/paisa-ai-coach",
        learning: "/paise-to-rupee-wisdom",
        health: "/health-scorecard",
        dashboard: "/dashboard",
        seohub: "/cabinet-and-resources",
        student_pdf: "/student-pdf-toolkit",
        teacher_hub: "/teacher-hub",
        petition_center: "/petitions",
        polls: "/polls",
        about: "/about",
        contact: "/contact",
        admin_portal: "/admin",
        login: "/login",
        signup: "/signup",
        forgot_password: "/forgot-password",
        reset_password: "/reset-password",
        verify_email: "/verify-email"
      };

      const mapped = WIDGET_PATH_MAP[widget];
      if (mapped) {
        return `${base}${mapped}`;
      }
      return `${base}/?widget=${widget}`;
    }
    
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search || "";
      const currentHash = window.location.hash || "";
      return `${base}${currentPath}${currentSearch}${currentHash}`;
    }
    
    return base;
  } catch (e) {
    // suppress
  }
  return "https://paisablueprint.in";
}

