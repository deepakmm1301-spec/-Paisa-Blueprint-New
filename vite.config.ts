import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
      'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          dashboard: path.resolve(__dirname, 'dashboard/index.html'),
          profiles: path.resolve(__dirname, 'profiles/index.html'),
          personal_finance_dashboard: path.resolve(__dirname, 'personal-finance-dashboard/index.html'),
          sip_calculator: path.resolve(__dirname, 'sip-calculator/index.html'),
          nps_calculator: path.resolve(__dirname, 'nps-calculator/index.html'),
          pension_calculator: path.resolve(__dirname, 'pension-calculator/index.html'),
          salary_calculator: path.resolve(__dirname, 'salary-calculator/index.html'),
          da_calculator: path.resolve(__dirname, 'da-calculator/index.html'),
          about: path.resolve(__dirname, 'about/index.html'),
          contact: path.resolve(__dirname, 'contact/index.html'),
          bpsc_salary: path.resolve(__dirname, 'bpsc-teacher-salary-calculator/index.html'),
          bihar_da: path.resolve(__dirname, 'bihar-da-calculator/index.html'),
          govt_sip: path.resolve(__dirname, 'government-employee-sip-calculator/index.html'),
          nps_govt: path.resolve(__dirname, 'nps-calculator-for-government-employees/index.html'),
          salary: path.resolve(__dirname, 'salary-calculator/index.html'),
          pension: path.resolve(__dirname, 'pension-calculator/index.html'),
          sip: path.resolve(__dirname, 'plan-sip/index.html'),
          learning: path.resolve(__dirname, 'paise-to-rupee-wisdom/index.html'),
          health: path.resolve(__dirname, 'health-scorecard/index.html'),
          retirement: path.resolve(__dirname, 'retirement-roadmap/index.html'),
          goals: path.resolve(__dirname, 'my-goal-planner/index.html'),
          tax: path.resolve(__dirname, 'tax-regime-optimizer/index.html'),
          networth: path.resolve(__dirname, 'my-wealth-tracker/index.html'),
          seohub: path.resolve(__dirname, 'cabinet-and-resources/index.html'),
          cibil: path.resolve(__dirname, 'cibil-credit-card/index.html'),
          debt: path.resolve(__dirname, 'debt-freedom-planner/index.html'),
          coach: path.resolve(__dirname, 'paisa-ai-coach/index.html'),
          eight_pay_calc: path.resolve(__dirname, '8th-pay-commission-calculator/index.html'),
          petitions: path.resolve(__dirname, 'petitions/index.html'),
          mutual_transfer: path.resolve(__dirname, 'mutual-transfer/index.html'),
          teacher_hub: path.resolve(__dirname, 'teacher-hub/index.html'),
          eight_pay_fitment: path.resolve(__dirname, '8th-pay-fitment-factor-calculator/index.html'),
          eight_pay_hike: path.resolve(__dirname, '8th-pay-salary-hike-calculator/index.html'),
          eight_pay_pension: path.resolve(__dirname, '8th-pay-pension-calculator/index.html'),
          eight_pay_news: path.resolve(__dirname, '8th-pay-commission-latest-news/index.html'),
          eight_pay_fitment_info: path.resolve(__dirname, '8th-pay-commission-fitment-factor/index.html'),
          eight_pay_chart: path.resolve(__dirname, '8th-pay-commission-salary-chart/index.html'),
          eight_pay_date: path.resolve(__dirname, '8th-pay-commission-date/index.html'),
          eight_pay_teachers: path.resolve(__dirname, '8th-pay-commission-for-teachers/index.html'),
          student_pdf_toolkit: path.resolve(__dirname, 'student-pdf-toolkit/index.html'),
          student_pdf: path.resolve(__dirname, 'student-pdf/index.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
