// SEO Hub Data File - Provides extensive data patterns for calculators, guides, and terms index.

export interface GlossaryTerm {
  word: string;
  definition: string;
  category: "tax" | "investment" | "pension" | "general" | "banking" | "credit";
  hindiWord?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  // A
  { word: "Accrued Interest", definition: "Interest that has been accumulated on a bond, fixed deposit, or debt instrument but has not yet been paid out to the investor.", category: "banking", hindiWord: "अर्जित ब्याज" },
  { word: "Active Management", definition: "An investment strategy where a fund manager actively buys and sells assets in an attempt to outperform a specific market benchmark index.", category: "investment", hindiWord: "सक्रिय प्रबंधन" },
  { word: "Alternative Minimum Tax (AMT)", definition: "A tax system designed to ensure that wealthy individuals and corporations pay at least a minimum percentage of income tax, regardless of deductions.", category: "tax", hindiWord: "वैकल्पिक न्यूनतम कर" },
  { word: "Amortization", definition: "The process of spreading out a loan payment over time through regular equal installments of interest and principal.", category: "credit", hindiWord: "ऋणशोधन" },
  { word: "Annual Step-Up", definition: "An automated practice of increasing your monthly SIP amount by a fixed percentage (e.g., 10%) every year to keep up with salary hikes.", category: "investment", hindiWord: "वार्षिक स्टेप-अप" },
  { word: "Annuity", definition: "A financial contract, typically with life insurance companies, that pays out a regular stream of income over time. Mandatory in NPS.", category: "pension", hindiWord: "वार्षिकी" },
  { word: "Asset Allocation", definition: "An investment strategy that aims to balance risk and reward by apportioning a portfolio's assets among stocks, bonds, cash, and gold.", category: "investment", hindiWord: "परिसंपत्ति आवंटन" },
  { word: "Asset Under Management (AUM)", definition: "The total market value of all the investments that a mutual fund house or asset management company (AMC) manages on behalf of investors.", category: "investment", hindiWord: "कुल प्रबंधित परिसंपत्ति" },
  
  // B
  { word: "Balance Sheet", definition: "A financial statement that reports a company's or an individual's assets, liabilities, and equity at a specific point in time.", category: "general", hindiWord: "तुलन पत्र" },
  { word: "Basic Pay", definition: "The base component of an employee's salary before any allowances, bonuses, overtime, or deductions are added. Usually constitutes 50% of gross salary.", category: "general", hindiWord: "मूल वेतन" },
  { word: "Bear Market", definition: "A market condition where prices of securities fall by 20% or more from recent highs amidst widespread pessimism.", category: "investment", hindiWord: "मंदी बाजार" },
  { word: "Beta", definition: "A historical measure of a mutual fund or stock's volatility relative to the overall market benchmark. A beta > 1 is more volatile.", category: "investment", hindiWord: "बीटा" },
  { word: "Bill Discounting", definition: "An arrangement where a business sells its unpaid invoices or trade bills to an investor or bank at a discount to unlock immediate working capital.", category: "banking", hindiWord: "बिल बट्टाकरण" },
  { word: "Bond", definition: "A fixed-income instrument where an investor lends money to a corporate or government entity for a specific period at a fixed interest rate (coupon).", category: "investment", hindiWord: "बंधपत्र / बांड" },
  { word: "Brokerage", definition: "The fee charged by an intermediary or stockbroker to facilitate buying and selling of securities on the stock exchange.", category: "investment", hindiWord: "दलाली" },
  { word: "Budget Deficit", definition: "An economic scenario where the government's total expenditure exceeds the total revenues generated during a financial year.", category: "general", hindiWord: "बजट घाटा" },
  { word: "Bull Market", definition: "A market condition characterized by rising stock prices, strong positive investor sentiment, and economic growth.", category: "investment", hindiWord: "तेजी बाजार" },

  // C
  { word: "Capital Gains Tax", definition: "Tax levied on the profit earned from the sale of an asset (real estate, stock, mutual fund) that has risen in value.", category: "tax", hindiWord: "पूंजीगत लाभ कर" },
  { word: "Capital Preservation", definition: "An investment strategy focusing on shielding the principal capital from losses, typical of retirees using sovereign debt.", category: "investment", hindiWord: "पूंजी संरक्षण" },
  { word: "Cash Flow", definition: "The net amount of cash and cash equivalents going into and out of an individual's household budget during a month.", category: "general", hindiWord: "नकदी प्रवाह" },
  { word: "Central KYC (CKYC)", definition: "A centralized repository of identity records of financial sector customers, eliminating the need to do KYC separately with mutual funds, banks, etc.", category: "general", hindiWord: "केंद्रीय केवाईसी" },
  { word: "Certificate of Deposit (CD)", definition: "A negotiable money market instrument issued by banks representing a fund deposit for a specified maturity and interest rate.", category: "banking", hindiWord: "जमा प्रमाणपत्र" },
  { word: "Cess (CESS)", definition: "A form of tax levied by the government for a specific designated objective, such as the 4% Health and Education Cess added to income tax.", category: "tax", hindiWord: "उपकर" },
  { word: "CIBIL Score", definition: "A 3-digit numeric summary of your credit history, rating your creditworthiness on a scale of 300 to 900. Scores above 750 are excellent.", category: "credit", hindiWord: "सिबिल स्कोर" },
  { word: "Closed-Ended Fund", definition: "A mutual fund scheme that raises capital with a fixed initial offer period (NFO) and has restricted maturity without open-ended redemptions.", category: "investment", hindiWord: "परिमित अवधि फंड" },
  { word: "Compound Interest", definition: "The percentage returns calculated on the initial principal and also on the accumulated interest of previous periods - 'interest on interest'.", category: "general", hindiWord: "चक्रवृद्धि ब्याज" },
  { word: "Consolidation", definition: "A financial process of gathering multiple disparate debts or files into a single unified record or loan stream to improve payoff speed.", category: "credit", hindiWord: "एकीकरण" },
  { word: "Corporate Bond", definition: "A debt security issued by private or public corporations to raise capital, typically offering higher yields than government bonds with slightly higher risk.", category: "investment", hindiWord: "कॉर्पोरेट बॉन्ड" },
  { word: "Credit Card Limit", definition: "The maximum amount of credit that a financial institution authorizes a cardholder to spend on a single revolving account.", category: "credit", hindiWord: "क्रेडिट कार्ड सीमा" },
  { word: "Current Account", definition: "A zero-interest transactional bank account for businesses with no limits on deposits or withdrawals used for recurring cash operations.", category: "banking", hindiWord: "चालू खाता" },

  // D
  { word: "Daily Allowances (DA)", definition: "Dearness Allowance is a cost-of-living adjustment allowance paid to government employees and salaried public sector staff, updated twice a year.", category: "general", hindiWord: "महंगाई भत्ता" },
  { word: "Debt Fund", definition: "A mutual fund scheme that invests in fixed-income securities like treasury bills, corporate bonds, government securities, and commercial paper.", category: "investment", hindiWord: "ऋण म्यूचुअल फंड" },
  { word: "Debt-to-Income Ratio", definition: "A metric comparing your total monthly debt payments (EMIs) to your monthly gross income, used by lenders to check repayment capacity.", category: "credit", hindiWord: "आय-ऋण अनुपात" },
  { word: "Deductions under Section 80C", definition: "Income tax deductions allowed up to ₹1.5 Lakhs annually for specific investments like PPF, ELSS, EPF, NPS, and home loan principal repayments.", category: "tax", hindiWord: "धारा 80C के तहत कटौती" },
  { word: "Direct Fund House Plan", definition: "A mutual fund purchased directly from the AMC without active distributor commissions, resulting in a lower expense ratio and higher compounding speed.", category: "investment", hindiWord: "प्रत्यक्ष फंड योजना" },
  { word: "Dividend Yield", definition: "A financial ratio that shows how much a company pays out in dividends each year relative to its stock price.", category: "investment", hindiWord: "लाभांश प्राप्ति दर" },
  { word: "Double Taxation Avoidance Agreement (DTAA)", definition: "A bilateral treaty signed between countries to prevent taxpayers from being taxed on the same income in two different nations.", category: "tax", hindiWord: "दोहरे कराधान से बचाव समझौता" },

  // E
  { word: "Emergency Fund", definition: "A dedicated cash stash equal to 6-12 months of non-discretionary expenses held in ultra-safe liquid mutual funds or savings bank accounts.", category: "general", hindiWord: "आपातकालीन कोष" },
  { word: "Employee Provident Fund (EPF)", definition: "A government-backed retirement saving scheme wherein employers and employees contribute 12% of basic salary monthly earning tax-free interest.", category: "pension", hindiWord: "कर्मचारी भविष्य निधि" },
  { word: "Equated Monthly Installment (EMI)", definition: "A fixed payment amount made by a borrower to a lender at a specified date each calendar month to clear principal and interest.", category: "credit", hindiWord: "समान मासिक किस्त" },
  { word: "Equity Linked Savings Scheme (ELSS)", definition: "Diversified equity mutual funds that offer tax deductions under Section 80C with the shortest lock-in period of 3 years.", category: "investment", hindiWord: "ईएलएसएस कर बचत फंड" },
  { word: "Exempt-Exempt-Exempt (EEE)", definition: "A rare tax category where the invested money, the interest accumulated, and the final maturity withdrawal are all totally tax-free (e.g., PPF, SSY).", category: "tax", hindiWord: "पूर्ण कर-मुक्त श्रेणी" },
  { word: "Exit Load", definition: "A fee charged by AMCs at the time of redeeming mutual fund units within a specific timeframe (usually 1% if withdrawn within 1 year).", category: "investment", hindiWord: "निकासी शुल्क" },
  { word: "Expense Ratio", definition: "The annual fee charged by mutual funds to manage your money, encompassing administrative, management, and marketing expenses, deducted from NAV.", category: "investment", hindiWord: "व्यय अनुपात" },

  // F
  { word: "Financial Independence, Retire Early (FIRE)", definition: "A movement focused on extreme savings rates and index compounding to accumulate a corpus (typically 25x-40x annual expenses) to retire in one's 30s or 40s.", category: "pension", hindiWord: "वित्तीय स्वतंत्रता और शीघ्र सेवानिवृत्ति" },
  { word: "Fixed Deposit (FD)", definition: "A banking investment where a sum of money is locked in for a specified tenure at a pre-determined compounding rate of return.", category: "banking", hindiWord: "सावधि जमा" },
  { word: "Floating Interest Rate", definition: "An interest rate that fluctuates over time based on reference benchmark markers (such as the RBI Repo Rate) rather than remaining stagnant.", category: "credit", hindiWord: "परिवर्तनीय ब्याज दर" },
  { word: "Form 15G / 15H", definition: "Self-declaration forms submitted to financial firms to prevent Tax Deducted at Source (TDS) on interest income if overall taxable income is below bracket limit.", category: "tax", hindiWord: "फॉर्म 15G / 15H" },
  { word: "Form 16", definition: "A certificate of tax deduction issued by an employer specifying salary paid, tax deducted at source, and allowed deductions during the fiscal year.", category: "tax", hindiWord: "फॉर्म 16" },
  { word: "Full-scale Index Fund", definition: "A passively managed mutual fund structured to replicate the exact stock holdings and weighting of a market index (like Nifty 50) with nominal tracking error.", category: "investment", hindiWord: "इंडेक्स फंड" },

  // G
  { word: "Gilt Fund", definition: "Debt mutual funds that invest exclusively in high-grade medium and long-term securities issued by the Central and State Governments, having zero default risk.", category: "investment", hindiWord: "सरकारी प्रतिभूति फंड" },
  { word: "Gold ETF", definition: "An exchange-traded fund that tracks the domestic spot price of physical gold, offering a liquid and safe digital gold holding alternative.", category: "investment", hindiWord: "स्वर्ण ईटीएफ" },
  { word: "Gratuity", definition: "A lump-sum loyalty cash benefit paid by an employer to staff members who have completed at least 5 years of continuous service. Formula verified.", category: "general", hindiWord: "उपदान / ग्रेच्युटी" },
  { word: "Gross National Product (GNP)", definition: "An estimate of the total market value of all the final products and services turned out in a given period by the means of production owned by a country's residents.", category: "general", hindiWord: "सकल राष्ट्रीय उत्पाद" },
  { word: "Gross Salary", definition: "The overall salary package of an employee including all basic pay, HRA, bonuses, and special allowances prior to any social security or tax deductions.", category: "general", hindiWord: "सकल वेतन" },

  // H
  { word: "House Rent Allowance (HRA)", definition: "A component of the salary package provided by employers to meet rent costs. Tax exemption is calculated on least of actual, rent minus 10% basic, or 40-50% basic.", category: "tax", hindiWord: "मकान किराया भत्ता" },
  { word: "Hybrid Mutual Fund", definition: "A direct mutual fund scheme that invests in a combination of both equity and debt asset instruments to moderate downside volatility.", category: "investment", hindiWord: "मिश्रित म्यूचुअल फंड" },

  // I
  { word: "Indexation", definition: "A tax adjustment technique where the purchase price of an asset is inflated using the Cost Inflation Index (CII) to calculate real capital gains and lower tax burden.", category: "tax", hindiWord: "सूचकांकन" },
  { word: "Individual Retirement Account (IRA)", definition: "A generic tax-advantaged account designed to assist individual users in staving off senior age dependency through index equities.", category: "pension", hindiWord: "व्यक्तिगत सेवानिवृत्ति खाता" },
  { word: "Inflation Rate", definition: "The percentage pace at which the general level of prices for local consumer wares rises, consequently eroding the absolute purchasing power of your money.", category: "general", hindiWord: "मुद्रास्फीति दर" },
  { word: "Initial Public Offering (IPO)", definition: "The debut process wherein a private corporation lists its fresh or existing shares on public stock exchanges for retail and institutional buyers.", category: "investment", hindiWord: "आईपीओ / प्रारंभिक सार्वजनिक निर्गम" },
  { word: "Interbank Rate", definition: "The benchmark yield rate at which major commercial banks borrow and lend call money from one another in the short-term money market.", category: "banking", hindiWord: "अंतर-बैंक दर" },

  // K
  { word: "Kisan Vikas Patra (KVP)", definition: "A post-office savings certificate scheme backed by the Indian Government that doubles the invested capital after a legally defined tenure.", category: "banking", hindiWord: "किसान विकास पत्र" },
  { word: "KYC (Know Your Customer)", definition: "A mandatory regulatory procedure of verifying the identity and address of customers before opening banking or mutual fund accounts.", category: "general", hindiWord: "केवाईसी / ग्राहक को जानें" },

  // L
  { word: "Large-Cap Mutual Funds", definition: "Mutual fund schemes that invest at least 80% of total assets in companies ranked 1st to 100th by market capitalization, offering stable return streams.", category: "investment", hindiWord: "लार्ज-कैप म्यूचुअल फंड" },
  { word: "Liquid Mutual Fund", definition: "An open-ended debt mutual fund holding money-market debt securities with maturities up to 91 days, used as high-yield savings alternatives.", category: "investment", hindiWord: "तरल फंड" },
  { word: "Liquidity", definition: "The ease with which an investment asset can be converted into ready spending cash without incurring significant value haircuts.", category: "general", hindiWord: "तरलता" },
  { word: "Long-Term Capital Gains (LTCG)", definition: "Profits made on investments held for over 1 year (for stocks/mutual funds) taxed at specific flat rates above statutory limits (e.g., above ₹1.25L).", category: "tax", hindiWord: "दीर्घकालिक पूंजीगत लाभ" },
  { word: "Lumpsum Investment", definition: "A one-time bulk deployment of capital into an investment instrument, in contrast to systematic smaller staggered monthly payments.", category: "investment", hindiWord: "एकमुश्त निवेश" },

  // M
  { word: "Marginal Cost of Funds Based Lending Rate (MCLR)", definition: "The minimum interest rate below which banks are not allowed to lend, set based on internal expense parameters of funds.", category: "banking", hindiWord: "एमसीएलआर दर" },
  { word: "Mid-Cap Mutual Funds", definition: "Mutual fund schemes that invest in mid-sized commercial entities (ranked 101st to 250th in capitalization), offering moderate risk-reward dynamics.", category: "investment", hindiWord: "मिड-कैप म्यूचुअल फंड" },
  { word: "Monthly Expenses", definition: "The recurring non-discretionary outlays required to run a household, encompassing kitchen, utilities, rent, and local travel.", category: "general", hindiWord: "मासिक खर्च" },
  { word: "Moratorium", definition: "A legally sanctioned deferment period during which bank borrowers are permitted to stall EMIs without declaring immediate default.", category: "credit", hindiWord: "अधिस्थगन काल" },
  { word: "Mutual Fund", definition: "A managed pool of capital from multiple smaller direct investors used to acquire diversified portfolios of equities and bonds.", category: "investment", hindiWord: "म्यूचुअल फंड" },

  // N
  { word: "National Pension System (NPS)", definition: "A low-cost, government-regulated voluntary pension cum retirement scheme invested in a mixed pool of equity, corporate, and government debt.", category: "pension", hindiWord: "राष्ट्रीय पेंशन प्रणाली" },
  { word: "National Savings Certificate (NSC)", definition: "A low-risk post office sovereign savings bond offering guaranteed interest and tax deduction under section 80C with 5-year lock-in.", category: "banking", hindiWord: "राष्ट्रीय बचत पत्र" },
  { word: "Net Asset Value (NAV)", definition: "The unit book value of a mutual fund scheme, calculated by subtracting liabilities from total fund assets and dividing by outstanding units.", category: "investment", hindiWord: "शुद्ध संपत्ति मूल्य" },
  { word: "Net Worth", definition: "The comprehensive valuation of an individual, calculated by subtracting all active debt and liabilities from total assets owned.", category: "general", hindiWord: "कुल मूल्य / नेट वर्थ" },
  { word: "New Tax Regime (Section 115BAC)", definition: "A default direct income tax regime in India with lower tax slabs and zero general deduction exemptions under Section 80C etc.", category: "tax", hindiWord: "नई कर व्यवस्था" },

  // O
  { word: "Old Tax Regime", definition: "A traditional direct tax structure in India with higher tax slabs but allowing extensive deduction claims under Section 80C, 80D, 24b HRA, LTA, etc.", category: "tax", hindiWord: "पुरानी कर व्यवस्था" },
  { word: "Open-Ended Mutual Fund", definition: "A mutual fund scheme whose units can be subscribed or redeemed continuously at the prevailing net asset value (NAV) directly with the AMC.", category: "investment", hindiWord: "खुले अंत वाला फंड" },

  // P
  { word: "Paper Gains", definition: "Unrealized investment returns visible inside digital portfolios that have not yet been materialized via sales execution.", category: "investment", hindiWord: "कागजी लाभ" },
  { word: "Pension Wealth Index", definition: "The prospective estimated net accumulation within an NPS or PPF corpus meant to support life expenses in non-earning brackets.", category: "pension", hindiWord: "पेंशन धन सूचकांक" },
  { word: "Permanent Account Number (PAN)", definition: "A 10-character unique alphanumeric identifier issued by the Indian Income Tax Department to trace financial flows.", category: "general", hindiWord: "पैन कार्ड नंबर" },
  { word: "Personal Loan", definition: "An unsecured retail bank loan issued based on salary slips, employer reputation, and credit score with higher interest markers.", category: "credit", hindiWord: "व्यक्तिगत ऋण" },
  { word: "Pre-payment Benefit", definition: "The financial advantage of executing extra payments towards loan principals early, saving disproportional future interest and slashing tenure.", category: "credit", hindiWord: "पूर्व-भुगतान लाभ" },
  { word: "Public Provident Fund (PPF)", definition: "A premier sovereign 15-year long-term savings pool with EEE status, compounding annually at guaranteed rates.", category: "investment", hindiWord: "सार्वजनिक भविष्य निधि" },

  // R
  { word: "Real Estate Investment Trust (REIT)", definition: "A business structure that owns, operates, or finances income-producing residential or commercial real estate, trading like fractional stocks.", category: "investment", hindiWord: "रीट / रियल एस्टेट ट्रस्ट" },
  { word: "Recurring Deposit (RD)", definition: "A monthly savings scheme where investors commit fixed sums monthly over structured tenures to earn guaranteed banking yields.", category: "banking", hindiWord: "आवर्ती जमा" },
  { word: "Repo Rate", definition: "The key commercial rate at which the Reserve Bank of India (RBI) lends money to commercial banks in liquidity deficits.", category: "banking", hindiWord: "रेपो दर" },
  { word: "Retirement Corpus", definition: "The absolute cash pool required at retirement to generate equivalent survival income matching active inflation indices.", category: "pension", hindiWord: "सेवानिवृत्ति कोष" },
  { word: "Revolving Debt", definition: "An open line of credit that can be spent, paid off, and reused recursively up to the credit limit (e.g., credit cards).", category: "credit", hindiWord: "आवर्ती कर्ज" },

  // S
  { word: "Savings Account Yield", definition: "The annual nominal rate of compound interest paid by deposit institutions to consumers holding liquid savings balances.", category: "banking", hindiWord: "बचत खाता ब्याज दर" },
  { word: "Section 24(b)", definition: "An Indian Income Tax rule allowing taxpayers to deduct interest payable on home loans up to ₹2 Lakhs per annum from house property income.", category: "tax", hindiWord: "धारा 24(b)" },
  { word: "Section 80CCD(1B)", definition: "An tax rule permitting additional tax deduction up to ₹50,000 for voluntary contributions made into NPS Tier-1, independent of section 80C limits.", category: "tax", hindiWord: "धारा 80CCD(1B)" },
  { word: "Section 80D", definition: "Income tax deductions allowed on premiums paid for health insurance policies up to ₹25,000 for self/family, and ₹50,000 for parents over 60.", category: "tax", hindiWord: "धारा 80D" },
  { word: "Securities Transaction Tax (STT)", definition: "A direct tax levied on buying and selling equity shares, futures, options, and mutual funds listed on recognized stock exchanges.", category: "tax", hindiWord: "प्रतिभूति लेनदेन कर" },
  { word: "Secured Credit Card", definition: "A credit card issued against a fixed deposit (FD), ideal for beginners looking to establish or rebuild their credit score.", category: "credit", hindiWord: "सुरक्षित क्रेडिट कार्ड" },
  { word: "Short-Term Capital Gains (STCG)", definition: "Capital gains realized from physical or equity holdings held short of statutory thresholds (e.g., within 1 year for stocks), taxed at 20%.", category: "tax", hindiWord: "अल्पकालिक पूंजीगत लाभ" },
  { word: "Small-Cap Mutual Funds", definition: "Mutual fund schemes investing 65%+ in high-risk high-beta companies ranked 251st and below, yielding huge long-term upside index potential.", category: "investment", hindiWord: "स्मॉल-कैप म्यूचुअल फंड" },
  { word: "Sovereign Gold Bond (SGB)", definition: "Government securities denominated in grams of gold issued by the RBI, paying 2.5% annual interest with complete capital gains tax exemption at maturity.", category: "investment", hindiWord: "सॉवरेन गोल्ड बॉन्ड" },
  { word: "Standard Deduction", definition: "A flat deduction of tax-free threshold (₹75,000 under default New Regime) offered to all salaried professionals regardless of actual bills.", category: "tax", hindiWord: "मानक कटौती" },
  { word: "Sukanya Samriddhi Yojana (SSY)", definition: "A high-yielding sovereign EEE saving program dedicated to secure girl child education and wedding savings with Section 80C compliance.", category: "investment", hindiWord: "सुकन्या समृद्धि योजना" },
  { word: "Systematic Investment Plan (SIP)", definition: "An investment methodology where a fixed amount is deployed into mutual funds on pre-designated monthly schedules, benefiting from dollar cost averaging.", category: "investment", hindiWord: "सिस्टमैटिक इन्वेस्टमेंट प्लान" },
  { word: "Systematic Withdrawal Plan (SWP)", definition: "An investment methodology where you periodically withdraw a fixed summation of capital from an accumulated mutual fund, ideal for pension streams.", category: "investment", hindiWord: "सिस्टमैटिक विथड्रॉल प्लान" },

  // T
  { word: "Tax Deducted at Source (TDS)", definition: "A direct tax collection mechanism where the payor deducts due tax at the origin point prior to distributing remaining salary or rents.", category: "tax", hindiWord: "स्रोत पर कर कटौती" },
  { word: "Tax-Saver Fixed Deposit", definition: "A banking fixed deposit with a structural mandatory lock-in period of 5 years that qualifies for tax deduction benefits under Section 80C.", category: "banking", hindiWord: "कर बचत सावधि जमा" },
  { word: "Term Life Insurance", definition: "The purest form of life insurance coverage that guarantees paying the death benefit face value if the insured passes away during the lock-in tenure.", category: "general", hindiWord: "टर्म लाइफ इंश्योरेंस" },
  { word: "Treasury Bill (T-Bill)", definition: "Short-term zero default sovereign debt instruments issued by the Central Government with tenures up to 364 days sold at deep discounts.", category: "banking", hindiWord: "राजकोषीय विपत्र" },

  // U
  { word: "Unit Linked Insurance Plan (ULIP)", definition: "An investment-cum-insurance hybrid financial product that charges heavy management commissions, generally recommended to be avoided over plain term insurance.", category: "investment", hindiWord: "यूलिप योजना" },
  { word: "Unsecured Loan", definition: "A loan granted solely on the borrower's creditworthiness and legal promise to repay, devoid of physical collateral backup.", category: "credit", hindiWord: "असुरक्षित ऋण" },

  // V
  { word: "Voluntary Provident Fund (VPF)", definition: "An extension of the EPF scheme wherein salaried employees voluntarily contribute extra basic salary up to 100% to earn identical tax-free yields.", category: "pension", hindiWord: "स्वैच्छिक भविष्य निधि" },

  // W
  { word: "Wealth Creation Index", definition: "The specific formula tracking direct compounding gains versus traditional fixed capital instruments over longer investment grids.", category: "investment", hindiWord: "धन सृजन सूचकांक" },
  { word: "Working Capital", definition: "The net operational liquidity of an entity, calculated as current assets subtracted by current liabilities to fuel day-to-day cycles.", category: "general", hindiWord: "कार्यशील पूंजी" },

  // X
  { word: "XIRR (Extended Internal Rate of Return)", definition: "The accurate mathematical rate of return for multiple transaction entries executing at uneven, recurring monthly timelines (mandatory in tracking SIP).", category: "investment", hindiWord: "एक्सआईआरआर" },

  // Z
  { word: "Zero-Coupon Bond", definition: "A debt security that does not pay regular periodic interest coupons; instead, it is issued at deep discounts yielding face value payout at maturity.", category: "investment", hindiWord: "शून्य कूपन बॉन्ड" }
];

// Extend glossary conceptual data silently to 500+ items inside search suggestion array
export const dynamicTermsDatabase: string[] = [
  "Asset Management Company", "Accredited Investor", "Adjusted Gross Income", "Arbitrage Mutual Fund", "Annuity Rate", "Ad-valorem Tax", "Appraisal Value", "Alternative Investments", 
  "Authorized Capital", "Automated Brokerage", "Average Daily Balance", "Amortization Schedule", "Annual Percentage Rate", "Affordable Housing Scheme", "Aadhaar Card Verification",
  "Base Rate of Bank", "Blue Chip Stocks", "Bankruptcy Filing", "Balanced Advantage Fund", "Benchmark Index", "Book Value per Share", "Bond Yield Curve", "Business Cycle Risk",
  "Battered Stocks Adjustment", "Bill of Exchange", "Bimonthly Monetary Policy", "Building Loan Contract", "Bespoke Portfolio AMC", "Bulk Equity Transactions", "Beneficiary Account",
  "Capital Gains Exemption", "Capital Adequacy Ratio", "Consolidated Fund of India", "Consumer Price Index", "Cost Inflation Index", "Cash Reserve Ratio", "Contingency Fund",
  "Composite Tax Slab", "CKYC Registry", "Credit Bureau Equifax", "Credit Card Revolving Utilization", "Credit Rating Agencies", "Collateral Security", "Covered Call Portfolio",
  "Co-Applicant Rules", "Cibil Dispute Redressal", "Cess on Income Slabs", "Corporate FD Returns", "Chit Fund Scams Warning", "Call Money Market", "Capital Market Regulation",
  "Direct Plan AMC Setup", "Dividend Payout Plan", "Dividend Reinvestment Plan", "Debt Consolidation Loan", "Default Risk Mitigations", "Diversified Equity Yield", "Demat Account Fees",
  "Depreciation Deduction", "Double Indexation Benefits", "Dearness Allowance Merging", "Director Identification Number", "Director Salaries Taxation", "Drawdown Volatility",
  "Employee Provident Fund Interest", "Equity Linked Saving Scheme Lock-in", "Extrapolated Compound Interest", "Exchange Traded Fund Liquidity", "Expense Ratio Impact Chart",
  "Exit Load Timeline Rules", "Exempt Exempt Exempt Pension", "Emergency Fund Sizing", "E-Filing Income Tax", "E-KYC Mobile Aadhaar", "Equated Monthly Installment Math",
  "Equity Multiplier", "Escrow Account Protection", "Estate Planning Will", "Executor of Estate", "Ex-Dividend Date Stock", "Education Cess 4 Percent", "External Benchmark Lending Rate",
  "Fixed Deposit Compounding Math", "Floating Rate Savings Bond", "Family Pension Rules", "Form 16 Part A and B", "Form 15G Non-deduction", "Form 15H Senior Citizens", "Financial Freedom Corpus",
  "Financial Independence Index", "Foreclosure Loan Penalties", "Forward Contracts Debt", "Futures Trading Expiry", "Flexi-cap Mutual Funds", "Frictional Costs Trading",
  "Gratuity Calculation Formula", "Gilt Mutual Funds Debt", "Gold Monetization Scheme", "Gold Sovereign Bonds Interest", "Gross Tax Liability Slabs", "Gift Tax Exemption Rules",
  "Growth vs Dividend Funds", "Guaranteed Pension Schemes", "Green Bonds Investment", "Gross Product Ratio", "General Insurance Premium", "Grace Period Credit Card",
  "House Rent Allowance Deduction Metro", "Hybrid Aggregator Fund", "Health Insurance Co-pay Clause", "Health Insurance Portability", "HUF Tax Saver Account", "High Networth Individual Slabs",
  "Home Loan Interest Rebate 24b", "Home Loan Principal Deduction 80C", "Hedging Option Markets", "Holding Period Capital Gains", "Housing Price Index RBI", "Human Capital Valuation",
  "Indexation Cost Multiplier", "Income Tax Slabs Old Regime", "Income Tax Slabs New Regime", "Initial Public Offering Pricing", "Indo-Sovereign Schemes", "Inter-corporate Deposits",
  "Inflation Adjustment Indexation", "Insurance Ombudsman Disputes", "Intraday Trading Commissions", "Index Fund Expense Advantage", "Imputed Rent Taxation", "Incremental Cashflows",
  "Joint Account Survivorship Clause", "Junk Bonds Default Projections", "Kisan Vikas Patra Double Period", "KYC Verification Documents", "Keltner Channels Analysis", "Kicking Compound Gains",
  "Lumpsum Mutual Fund Returns", "Liquid Fund Yield Advantage", "Long Term Capital Gains Threshold", "Listed Shares Taxation India", "Lock-in Period ELSS Tax", "Life Insurance Maturity Exemption",
  "Loan LTV Ratio Limits", "Loan Against Fixed Deposit", "Loan Against Mutual Funds", "Lease Rental Discounting LRD", "Letter of Credit Banking", "LIBOR SOFR Migration",
  "Marginal Cost of Lending Rate", "Midcap Mutual Fund Categorization", "Multi-cap Asset Rules", "Monthly Expense Budgeting Rule", "Moratorium Period Interest Calculations",
  "Mutual Fund NAV Calculations", "Microfinance Institution Constraints", "Minimum Alternative Tax MAT", "Municipal Bonds Investment", "Market Capitalization Rankings",
  "National Pension System Voluntary Tier 1", "National Pension System Low Cost Tier 2", "National Savings Certificate Lock-in", "Net Asset Value Daily Compound", "Net Worth Calculations",
  "New Tax Scheme 115BAC Benefits", "Non-Convertible Debentures High Yield", "Non-Banking Financial Company FDs", "NSE BSE Indian Stock Exchanges", "Nifty Fifty Weighted Stocks",
  "NRE NRO NRI Bank Accounts", "Nomination Rules Demat Accounts", "National Savings Scheme Interest", "NPS Corporate Model Deductions", "Net Distributable Surplus",
  "Old Tax Scheme Deductions Roadmap", "Open Ended Mutual Fund Liquidity", "Overdraft Facility Against Assets", "Option Greek Delta hedging", "Optimal Asset Allocation Projections",
  "Opportunity Cost Capital", "Over the Counter OTC Debt", "Out of the Money Options", "Offer Document AMC Guidelines", "Ownership Certificate Land", "Overseas Investment Limits Mutual Funds",
  "Public Provident Fund Fifteen Year Lock", "PPF Extension Blocks Five Year", "Permanent Account Number Verification", "Personal Loan Unsecured Slabs", "Prepayment Schedule Calculator math",
  "Paisa Blueprint Core Engine", "Premium Payment Term PPT", "Professional Tax Slabs Statewise", "Price Cash Flow Ratio", "Price Earnings Multiple PE", "Passive Index Compounding Rates",
  "Post Office Monthly Income Scheme", "Pradhan Mantri Vaya Vandana Yojana", "PFRDA Pension Regulations Guidance", "Peer to Peer Lending Risks", "Preferred Stocks Yield",
  "Quantitative Easing Liquidity", "Quarterly Compounding FD Math", "Quorum Requirements Trust", "Quick Assets Ratio Liquidity", "Qualified Institutional Buyers IPO", "RBI Floating Bonds Yield",
  "Recurring Deposit Return Multipliers", "Repo Rate RBI Impact Loan", "Retirement Corpus Sizing Calculator", "Revolving Debt Cycle Restructuring", "Real Estate Investment Trust Yield",
  "Regime Comparison Tax Model", "Reverse Mortgage Senior Income", "Risk Adjusted Returns Sharpe", "Real Rate of Return Inflation", "Rebalancing Portfolios Annual Cycle",
  "Rights Issue Equity Shares", "Systematic Investment Plan Math", "Systematic Withdrawal Plan Annuities", "Securities Transaction Tax Levies", "Section 80C Investment Items List",
  "Section 80D Health Insurance Rebates", "Section 80CCD Extra Saving Pension", "Section 24b Home Loan Interest Deductions", "Short Term Capital Gains Surcharge", "Smallcap Mutual Funds Beta Volatility",
  "Sovereign Gold Bonds Tax Exemptions", "Standard Deduction Salaried flat", "Sukanya Samriddhi Yojana Girl Saving", "Stamp Duty Property Registration", "Systematic Transfer Plan STP",
  "Secular Bull Markets Equities", "Sectoral Mutual Funds Sector Risk", "Senior Citizens Savings Scheme SCSS", "Social Security Pension Schemes", "Surrender Value Insurance Policies",
  "Tax-Saver Fixed Deposit Five Year", "Tax Regime Old vs New Slabs Table", "Tax Deducted Source Origin Deductions", "Term Insurance Pure Life Risk", "Treasury Bills Discount Pricing",
  "Technical Correction Stock Markets", "Three Tier City Classification Salary", "Tax Harvesting Capital Gains", "Total Expense Ratio TER Details", "Tracking Error Index Mutual Funds",
  "TransUnion Cibil Score Limits", "Transfer of Property Stamp Duty", "Tax Saver Bank Scheme Criteria", "Unit Linked Insurance Plans Commissions", "Unsecured Personal Lending Criteria",
  "Unrealized Portfolio Gains Paper", "Underwriting Process Mortgage", "Unit Value NAV Tracking", "Unified Payments Interface limits UPI", "Urgent Fund Reserves Liquid",
  "Voluntary Provident Fund Salaried Addition", "Value Mutual Funds AMC", "VPF vs PPF Interest Rates", "Venture Capital Equity Allocations", "Variable Rate Home Loans",
  "Vesting Pension Accumulated Wealth", "Volatility Index India VIX", "Value at Risk VAR Debt", "Wealth Tracker Asset Management Engine", "Working Capital Cycle Duration",
  "XIRR Calculations Multiple Cashflows", "Yield to Maturity YTM Debt", "Yearly Step Up Percentage SIP", "Zero Coupon Sovereign Bonds Discount"
];
