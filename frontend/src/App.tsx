import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Simulator from "./pages/Simulator"
import Roadmap from "./pages/Roadmap"
import ExitPlan from "./pages/ExitPlan"
import Onboarding from "./pages/Onboarding"
import Chat from "./pages/Chat"
import Remittance from "./pages/Remittance"
import Accounts from "./pages/Accounts"
import Deposits from "./pages/Deposits"
import Cards from "./pages/Cards"
import Loans from "./pages/Loans"
import Securities from "./pages/Securities"
import Exchange from "./pages/Exchange"
import Invest from "./pages/Invest"
import PersonalizedInvest from "./pages/PersonalizedInvest"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/exit-plan" element={<ExitPlan />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/remittance" element={<Remittance />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/securities" element={<Securities />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/personalized-invest" element={<PersonalizedInvest />} />
      </Routes>
    </BrowserRouter>
  )
}
