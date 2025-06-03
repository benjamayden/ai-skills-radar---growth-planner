import React from "react";
import UserInputForm from "../components/UserInputForm";
import { UserInputData } from "../types";

interface TabDetailsProps {
  onSubmit: (data: UserInputData) => void;
  loading: boolean;
  initialData: UserInputData | null;
}

const TabDetails: React.FC<TabDetailsProps> = ({ onSubmit, loading, initialData }) => (
  <UserInputForm onSubmit={onSubmit} loading={loading} initialData={initialData} />
);

export default TabDetails;
