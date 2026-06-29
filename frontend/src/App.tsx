import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardPage } from "@/pages/DashboardPage";
import { DatasetPage } from "@/pages/DatasetPage";
import { ModelsPage } from "@/pages/ModelsPage";
import { PredictPage } from "@/pages/PredictPage";

export default function App() {
  return (
    <TooltipProvider delayDuration={250}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dataset" element={<DatasetPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

