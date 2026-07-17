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
      const targetQuery = widget ? `?widget=${widget}` : "";
      return `${base}${cleanPath}${targetQuery}`;
    } else if (widget) {
      return `${base}/?widget=${widget}`;
    }
    
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search || "";
      return `${base}${currentPath}${currentSearch}`;
    }
    
    return base;
  } catch (e) {
    // suppress
  }
  return "https://paisablueprint.in";
}

