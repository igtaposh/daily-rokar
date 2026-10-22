import React, { createContext, useState } from "react";

export const RecordContext = createContext();

export const RecordProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  return (
    <RecordContext.Provider value={{ records, setRecords }}>
      {children}
    </RecordContext.Provider>
  );
};
