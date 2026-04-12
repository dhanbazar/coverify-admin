import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HiOutlineX, HiOutlinePencil, HiOutlineSave, HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";
import { apiClient } from "../api/client";

interface Props {
  visible: boolean;
  caseId: string | null;  // UUID
  caseDisplayId: string;
  onClose: () => void;
}

interface SectionConfig {
  key: string;
  label: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "array";
  options?: string[];
}

const SECTIONS: SectionConfig[] = [
  {
    key: "visitDetails",
    label: "Visit Details",
    fields: [
      { key: "applicantName", label: "Applicant Name", type: "text" },
      { key: "personMet", label: "Person Met", type: "text" },
      { key: "designationOfPersonMet", label: "Designation", type: "text" },
      { key: "dateTimeOfVisit", label: "Date & Time of Visit", type: "text" },
      { key: "addressOfMeeting", label: "Address", type: "text" },
      { key: "premiseType", label: "Premise Type", type: "select", options: ["Same", "Different", "Not Found"] },
      { key: "metByAgent", label: "Met By Agent", type: "text" },
      { key: "mobileNumber", label: "Mobile Number", type: "text" },
    ],
  },
  {
    key: "personalDetails",
    label: "Personal Details",
    fields: [
      { key: "familyMembersTotal", label: "Family Members", type: "number" },
      { key: "residenceOwnership", label: "Residence Ownership", type: "select", options: ["Owned", "Rented", "Company Provided", "Family"] },
      { key: "ownershipPercentInFirm", label: "Ownership % in Firm", type: "number" },
      { key: "residenceMarketValue", label: "Residence Market Value", type: "number" },
      { key: "rentAmount", label: "Monthly Rent", type: "number" },
      { key: "yearsAtAddress", label: "Years at Address", type: "number" },
      { key: "localityClass", label: "Locality Class", type: "select", options: ["Upper", "Middle", "Lower"] },
      { key: "typeOfResidence", label: "Type of Residence", type: "select", options: ["Independent House", "Flat", "Row House", "Chawl", "Slum"] },
      { key: "externalAppearance", label: "External Appearance", type: "select", options: ["Excellent", "Good", "Average", "Poor"] },
      { key: "constructionType", label: "Construction Type", type: "select", options: ["Pakka", "Semi-Pakka", "Kachha"] },
      { key: "vehiclesTwoWheeler", label: "Two-Wheelers", type: "number" },
      { key: "vehiclesFourWheeler", label: "Four-Wheelers", type: "number" },
    ],
  },
  {
    key: "businessProfile",
    label: "Business Profile",
    fields: [
      { key: "businessName", label: "Business Name", type: "text" },
      { key: "natureOfBusiness", label: "Nature of Business", type: "text" },
      { key: "businessExperienceYears", label: "Experience (Years)", type: "number" },
      { key: "numberOfStaff", label: "Number of Staff", type: "number" },
      { key: "businessLocationType", label: "Location Type", type: "select", options: ["Commercial", "Residential", "Industrial", "Mixed"] },
      { key: "gstRegistrationDate", label: "GST Registration Date", type: "text" },
      { key: "totalSalaryBill", label: "Total Salary Bill", type: "number" },
      { key: "businessPremiseOwnership", label: "Premises Ownership", type: "select", options: ["Owned", "Rented", "Leased"] },
      { key: "officeFactoryValue", label: "Office/Factory Value", type: "number" },
      { key: "typeOfOffice", label: "Type of Office", type: "text" },
      { key: "entryAllowed", label: "Entry Allowed", type: "boolean" },
      { key: "signBoardSeen", label: "Signboard Seen", type: "boolean" },
    ],
  },
  {
    key: "financials",
    label: "Financials",
    fields: [
      { key: "turnoverAmount", label: "Turnover", type: "number" },
      { key: "turnoverAssessmentYear", label: "Assessment Year", type: "text" },
      { key: "netProfit", label: "Net Profit", type: "text" },
      { key: "employeesSeenAtVisit", label: "Employees Seen", type: "number" },
      { key: "stockMachinerySeen", label: "Stock/Machinery Seen", type: "boolean" },
      { key: "stockMachineryDescription", label: "Description", type: "text" },
      { key: "premisesAreaSqFt", label: "Premises Area (sq ft)", type: "number" },
    ],
  },
  {
    key: "referenceCheck",
    label: "Reference Check",
    fields: [
      { key: "neighbour1Name", label: "Neighbour 1 Name", type: "text" },
      { key: "neighbour1Phone", label: "Neighbour 1 Phone", type: "text" },
      { key: "neighbour1Status", label: "Neighbour 1 Status", type: "select", options: ["Positive", "Negative"] },
      { key: "neighbour1Feedback", label: "Neighbour 1 Feedback", type: "text" },
      { key: "neighbour2Name", label: "Neighbour 2 Name", type: "text" },
      { key: "neighbour2Phone", label: "Neighbour 2 Phone", type: "text" },
      { key: "neighbour2Status", label: "Neighbour 2 Status", type: "select", options: ["Positive", "Negative"] },
      { key: "neighbour2Feedback", label: "Neighbour 2 Feedback", type: "text" },
    ],
  },
];

async function fetchFormData(caseId: string) {
  const { data } = await apiClient.get(`/cases/${caseId}/form`);
  return data.data;
}

async function saveFormData(caseId: string, formData: Record<string, unknown>) {
  await apiClient.put(`/cases/${caseId}/form`, formData);
}

export function FormDataModal({ visible, caseId, caseDisplayId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTIONS.map((s) => s.key)));

  const { data: formData, isLoading, error } = useQuery({
    queryKey: ["form-data", caseId],
    queryFn: () => fetchFormData(caseId!),
    enabled: visible && !!caseId,
  });

  const saveMutation = useMutation({
    mutationFn: () => saveFormData(caseId!, editData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["form-data", caseId] });
      setEditing(false);
    },
  });

  useEffect(() => {
    if (formData) {
      // Flatten all sections into a single object for editing
      const flat: Record<string, any> = {};
      for (const section of SECTIONS) {
        const sectionData = (formData as any)[section.key] ?? {};
        for (const field of section.fields) {
          flat[field.key] = sectionData[field.key] ?? "";
        }
      }
      setEditData(flat);
    }
  }, [formData]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateField = (key: string, value: any) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Reconstruct sectioned form data from flat editData
    const structured: Record<string, any> = {};
    for (const section of SECTIONS) {
      const sectionObj: Record<string, any> = {};
      for (const field of section.fields) {
        if (editData[field.key] !== undefined && editData[field.key] !== "") {
          sectionObj[field.key] = editData[field.key];
        }
      }
      if (Object.keys(sectionObj).length > 0) {
        structured[section.key] = sectionObj;
      }
    }
    saveMutation.mutate();
  };

  const getValue = (sectionKey: string, fieldKey: string): any => {
    if (editing) return editData[fieldKey] ?? "";
    return (formData as any)?.[sectionKey]?.[fieldKey] ?? "";
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Verification Form Data</h2>
            <p className="text-sm text-gray-500">{caseDisplayId}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing && formData && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                <HiOutlinePencil size={14} /> Edit
              </button>
            )}
            {editing && (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <HiOutlineSave size={14} /> {saveMutation.isPending ? "Saving..." : "Save"}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading && <div className="text-center text-gray-400 py-8">Loading form data...</div>}

          {error && (
            <div className="text-center text-gray-400 py-8">
              No form data available for this case yet.
            </div>
          )}

          {saveMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Failed to save changes. Please try again.
            </div>
          )}

          {saveMutation.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Form data updated successfully.
            </div>
          )}

          {formData && SECTIONS.map((section) => {
            const sectionData = (formData as any)[section.key];
            const hasData = sectionData && Object.keys(sectionData).some((k: string) => sectionData[k] !== undefined && sectionData[k] !== null && sectionData[k] !== "");
            const isExpanded = expandedSections.has(section.key);

            return (
              <div key={section.key} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{section.label}</span>
                    {hasData ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded-full">Filled</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">Empty</span>
                    )}
                  </div>
                  {isExpanded ? <HiOutlineChevronDown size={16} className="text-gray-400" /> : <HiOutlineChevronRight size={16} className="text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="px-4 py-3 space-y-2">
                    {section.fields.map((field) => {
                      const value = getValue(section.key, field.key);
                      const displayValue = value === true ? "Yes" : value === false ? "No" : String(value || "—");

                      if (editing) {
                        return (
                          <div key={field.key} className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-xs font-medium text-gray-500 col-span-1">{field.label}</label>
                            <div className="col-span-2">
                              {field.type === "select" ? (
                                <select
                                  value={editData[field.key] ?? ""}
                                  onChange={(e) => updateField(field.key, e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="">—</option>
                                  {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : field.type === "boolean" ? (
                                <select
                                  value={editData[field.key] === true ? "true" : editData[field.key] === false ? "false" : ""}
                                  onChange={(e) => updateField(field.key, e.target.value === "true" ? true : e.target.value === "false" ? false : "")}
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="">—</option>
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              ) : (
                                <input
                                  type={field.type === "number" ? "number" : "text"}
                                  value={editData[field.key] ?? ""}
                                  onChange={(e) => updateField(field.key, field.type === "number" ? Number(e.target.value) || "" : e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              )}
                            </div>
                          </div>
                        );
                      }

                      // View mode
                      return (
                        <div key={field.key} className="grid grid-cols-3 gap-2 py-1">
                          <span className="text-xs font-medium text-gray-500 col-span-1">{field.label}</span>
                          <span className="text-sm text-gray-900 col-span-2">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
