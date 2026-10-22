import React, { createContext, useState } from "react";

export const AepsContext = createContext();

export const AepsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  return (
    <AepsContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </AepsContext.Provider>
  );
};
