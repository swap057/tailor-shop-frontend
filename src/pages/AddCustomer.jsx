// import React, { useState, useEffect } from "react";
// import { Form, Button, Row, Col, Card } from "react-bootstrap";
// import { useNavigate, useLocation } from "react-router-dom"; // <-- ADDED useLocation
// import {
//   FaUser,
//   FaTshirt,
//   FaRulerVertical,
//   FaSave,
//   FaArrowLeft,
// } from "react-icons/fa";
// import { useLang } from "../context/LangContext";

// // IMPORTS
// import { addCustomer, addOrder } from "../services/api";
// import { validateForm } from "../utils/validation";
// import PhotoCapture from "../components/common/PhotoCapture";
// import MeasurementCard from "../components/orders/MeasurementCard";
// import { useToast } from "../context/ToastContext";

// const AddCustomer = () => {
//   const navigate = useNavigate();
//   const location = useLocation(); // <-- INIT useLocation
//   const { t } = useLang();
//   const { showToast } = useToast();

//   const minDate = new Date().toISOString().split("T")[0];

//   // --- STATE ---
//   const initialState = {
//     full_name: "",
//     mobile_no: "",
//     address: "",
//     photo: null,
//     deadline_date: "",

//     // Shirt
//     shirt_length: "",
//     shirt_front: "",
//     shirt_shoulder: "",
//     shirt_sleeve: "",
//     shirt_collar_cuff: "",
//     shirt_chest: "",
//     shirt_half_sleeves: "",
//     shirt_selected_styles: {},

//     // Pant
//     pant_length: "",
//     pant_below_waist: "",
//     pant_waist: "",
//     pant_thigh: "",
//     pant_knee: "",
//     pant_bottom: "",
//     pant_selected_styles: {},

//     remark: "",
//   };

//   const [formData, setFormData] = useState(initialState);
//   const [currentCustomerId, setCurrentCustomerId] = useState(null);

//   // --- NEW: CATCH PRE-FILL DATA (PROFILE + MEASUREMENTS) FROM FIND CUSTOMER ---
//   useEffect(() => {
//     if (location.state && location.state.prefillCustomer) {
//       const customer = location.state.prefillCustomer;
//       const meas = customer.measurements || {}; 

//       setFormData((prev) => ({
//         ...prev,
//         // 1. Profile Data
//         full_name: customer.fullName || "",
//         mobile_no: customer.mobileNo || "",
//         address: customer.address || "",

//         // 2. Shirt Measurements (Includes Length & Half Sleeves)
//         shirt_length: meas.shirtLength || "",
//         shirt_half_sleeves: meas.shirtHalfSleeve || "",
//         shirt_chest: meas.shirtChest || "",
//         shirt_shoulder: meas.shirtShoulder || "",
//         shirt_sleeve: meas.shirtSleeve || "",
//         shirt_front: meas.shirtFront || "",
//         shirt_collar_cuff: meas.shirtCollar || "", 
        
//         // 3. Pant Measurements
//         pant_waist: meas.pantWaist || "",
//         pant_length: meas.pantLength || "",
//         pant_bottom: meas.pantBottom || "",
//         pant_thigh: meas.pantThigh || "",
//         pant_knee: meas.pantKnee || "",
//       }));
      
//       setCurrentCustomerId(customer.customerId);
//     }
//   }, [location.state]);

//   // Session Storage load
//   useEffect(() => {
//     // Only load from session if we didn't just prefill from Find Customer
//     if (!location.state?.prefillCustomer) {
//         const saved = sessionStorage.getItem("addCustomerForm");
//         if (saved) setFormData(JSON.parse(saved));
//     }
//   }, [location.state]);

//   // Session Storage save
//   useEffect(() => {
//     sessionStorage.setItem("addCustomerForm", JSON.stringify(formData));
//   }, [formData]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "mobile_no") {
//       if (/^\d*$/.test(value) && value.length <= 10)
//         setFormData({ ...formData, [name]: value });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handlePhotoSelect = (file) => setFormData({ ...formData, photo: file });

//   // --- SMART GROUP LOGIC FOR SHIRT LENGTH ---
//   const getRequiredShirtLengthCount = (selectedStylesObj) => {
//     const styles = Object.keys(selectedStylesObj);
//     if (styles.length === 0) return 1;

//     let count = 0;

//     // Group 1: Long Kurta
//     if (styles.includes(t("longKurta")) || styles.includes("Long Kurta"))
//       count++;

//     // Group 2: Short Kurta
//     if (styles.includes(t("shortKurta")) || styles.includes("Short Kurta"))
//       count++;

//     // Group 3: The Other 5 Styles
//     const otherStyles = [
//       t("appleCut"),
//       "Apple Cut",
//       t("manella"),
//       "Manella",
//       t("pickCut"),
//       "Pick Cut",
//       t("nehruJacket"),
//       "Nehru Jacket",
//       t("threeButton"),
//       "Three Button",
//     ];
//     if (styles.some((s) => otherStyles.includes(s))) count++;

//     return count === 0 ? 1 : count;
//   };

//   // Helper passed to MeasurementCard
//   const getRequiredFieldCount = (fieldName, selectedStylesObj) => {
//     if (fieldName === "shirt_length")
//       return getRequiredShirtLengthCount(selectedStylesObj);
//     if (fieldName === "shirt_collar_cuff") return 2; // STRICTLY 2 Values Always
//     return 1; // Everything else (Pants, Chest, Sleeves, etc.) is STRICTLY 1 value
//   };

//   // --- 1. STYLE HANDLER ---
//   const handleStyleChange = (category, styleName, operation) => {
//     const key =
//       category === "shirt" ? "shirt_selected_styles" : "pant_selected_styles";
//     const currentList = { ...formData[key] };
//     const currentQty = currentList[styleName] || 0;

//     let newQty = currentQty;
//     if (operation === "increment") newQty += 1;
//     if (operation === "decrement" && currentQty > 0) newQty -= 1;

//     const futureList = { ...currentList };
//     if (newQty === 0) delete futureList[styleName];
//     else futureList[styleName] = newQty;

//     const appendSlash = (val) =>
//       val &&
//       val.toString().trim() !== "" &&
//       !val.toString().trim().endsWith("/")
//         ? val + " / "
//         : val;

//     // Auto-Append Slash ONLY for Shirt Length when entering a new group
//     if (operation === "increment" && currentQty === 0 && category === "shirt") {
//       const reqLenBefore = getRequiredShirtLengthCount(currentList);
//       const reqLenAfter = getRequiredShirtLengthCount(futureList);
//       if (reqLenAfter > reqLenBefore) {
//         setFormData((prev) => ({
//           ...prev,
//           shirt_length: appendSlash(prev.shirt_length),
//         }));
//       }
//     }

//     setFormData((prev) => ({ ...prev, [key]: futureList }));
//   };

//   // --- 2. SMART ENTER LOGIC ---
//   const handleSmartEnter = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault(); // Prevent default form submission on enter anywhere

//       const { name, value } = e.target;

//       // Handle Enter explicitly on Select dropdowns
//       if (e.target.tagName === "SELECT") {
//         shiftFocus(e, name);
//         return;
//       }

//       const isShirtMultiField = ["shirt_length", "shirt_collar_cuff"].includes(
//         name,
//       );

//       if (isShirtMultiField) {
//         const requiredCount = getRequiredFieldCount(
//           name,
//           formData.shirt_selected_styles,
//         );
//         const currentCount = value
//           .toString()
//           .split("/")
//           .filter((v) => v.trim() !== "").length;

//         // Add slash if we need more values
//         if (currentCount < requiredCount) {
//           if (!value.toString().trim().endsWith("/")) {
//             setFormData((prev) => ({ ...prev, [name]: value + " / " }));
//           }
//           return;
//         }
//       }

//       // If requirements met or standard field, jump!
//       shiftFocus(e, name);
//     }
//   };

//   const getTotalQty = (styleObj) =>
//     Object.values(styleObj).reduce((a, b) => a + b, 0);

//   const shiftFocus = (e, currentFieldName) => {
//     const form = e.target.form;

//     // JUMP 1: From Half Sleeves -> Pant Dropdown
//     if (currentFieldName === "shirt_half_sleeves") {
//       const pantSelect = document.getElementById("pant_style_select");
//       if (pantSelect) {
//         pantSelect.focus();
//       }
//       return;
//     }

//     // JUMP 2: From Pant Dropdown -> Pant Length OR Save
//     if (currentFieldName === "pant_style_select") {
//       const pantTotal = getTotalQty(formData.pant_selected_styles);
//       if (pantTotal > 0 && form.elements["pant_length"]) {
//         form.elements["pant_length"].focus();
//       } else {
//         document.getElementById("saveOrderBtn")?.focus();
//       }
//       return;
//     }

//     // JUMP 3: From end of Pants straight to Save
//     if (currentFieldName === "pant_bottom") {
//       document.getElementById("saveOrderBtn")?.focus();
//       return;
//     }

//     // Standard Focus Jump
//     const index = Array.prototype.indexOf.call(form, e.target);
//     let nextIndex = index + 1;
//     let nextElement = form.elements[nextIndex];

//     while (
//       nextElement &&
//       (nextElement.type === "button" || nextElement.disabled)
//     ) {
//       nextIndex++;
//       nextElement = form.elements[nextIndex];
//     }

//     if (nextElement) nextElement.focus();
//   };

//   const getStyleString = (styleObj) =>
//     Object.entries(styleObj)
//       .map(([s, q]) => `${s} (${q})`)
//       .join(", ");

//   const saveToBackend = async () => {
//     const validation = validateForm(formData, t);
//     if (!validation.isValid) {
//       showToast(validation.message, "danger");
//       return false;
//     }

//     const shirtTotal = getTotalQty(formData.shirt_selected_styles);
//     const pantTotal = getTotalQty(formData.pant_selected_styles);

//     let customerIdToUse = currentCustomerId;
//     if (!customerIdToUse) {
//       customerIdToUse = await addCustomer({
//         fullName: formData.full_name,
//         mobileNo: formData.mobile_no,
//         address: formData.address,
//         photoPath: "pending_upload.jpg",
//       });
//       setCurrentCustomerId(customerIdToUse);
//     }

//     const orderPayload = {
//       customerId: customerIdToUse,
//       deadlineDate: formData.deadline_date,
//       languageReq: "English",
//       shirtLength: shirtTotal > 0 ? formData.shirt_length : "0",
//       shirtCollar: shirtTotal > 0 ? formData.shirt_collar_cuff : "0",
//       shirtFront: shirtTotal > 0 ? parseFloat(formData.shirt_front) || 0 : 0,
//       shirtShoulder:
//         shirtTotal > 0 ? parseFloat(formData.shirt_shoulder) || 0 : 0,
//       shirtSleeve: shirtTotal > 0 ? parseFloat(formData.shirt_sleeve) || 0 : 0,
//       shirtChest: shirtTotal > 0 ? parseFloat(formData.shirt_chest) || 0 : 0,
//       shirtHalfSleeve:
//         shirtTotal > 0 ? parseFloat(formData.shirt_half_sleeves) || 0 : 0,
//       shirtStyle:
//         shirtTotal > 0
//           ? getStyleString(formData.shirt_selected_styles)
//           : "None",
//       shirtQty: shirtTotal,
//       pantLength: pantTotal > 0 ? formData.pant_length : "0",
//       pantBelowWaist:
//         pantTotal > 0 ? parseFloat(formData.pant_below_waist) || 0 : 0,
//       pantWaist: pantTotal > 0 ? parseFloat(formData.pant_waist) || 0 : 0,
//       pantThigh: pantTotal > 0 ? parseFloat(formData.pant_thigh) || 0 : 0,
//       pantKnee: pantTotal > 0 ? parseFloat(formData.pant_knee) || 0 : 0,
//       pantBottom: pantTotal > 0 ? parseFloat(formData.pant_bottom) || 0 : 0,
//       pantStyle:
//         pantTotal > 0 ? getStyleString(formData.pant_selected_styles) : "None",
//       pantQty: pantTotal,
//       remark: formData.remark,
//     };

//     await addOrder(orderPayload);
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const success = await saveToBackend();
//       if (success) {
//         showToast("Order Saved Successfully!", "success");
//         setFormData(initialState);
//         setCurrentCustomerId(null);
//         sessionStorage.removeItem("addCustomerForm");
//         navigate("/");
//       }
//     } catch (error) {
//       const backendMsg =
//         error.response?.data?.message || "Failed to save. Check network.";
//       showToast(backendMsg, "danger");
//     }
//   };

//   const shirtTotal = getTotalQty(formData.shirt_selected_styles);
//   const pantTotal = getTotalQty(formData.pant_selected_styles);

//   const shirtFields = [
//     { label: t("length"), name: "shirt_length", type: "text", ph: "32 / 40" },
//     { label: t("front"), name: "shirt_front", ph: "00.00" },
//     { label: t("shoulder"), name: "shirt_shoulder", ph: "00.00" },
//     { label: t("sleeve"), name: "shirt_sleeve", ph: "00.00" },
//     {
//       label: "Collar / Cuff",
//       name: "shirt_collar_cuff",
//       type: "text",
//       ph: "15 / 9.5",
//     },
//     { label: t("chest") + " (Opt)", name: "shirt_chest", ph: "00.00" },
//     { label: "Half Sleeves (Opt)", name: "shirt_half_sleeves", ph: "00.00" },
//   ];

//   const pantFields = [
//     { label: t("length"), name: "pant_length", type: "text", ph: "38" },
//     { label: t("belowWaist"), name: "pant_below_waist", ph: "00.00" },
//     { label: t("waist"), name: "pant_waist", ph: "00.00" },
//     { label: t("thigh"), name: "pant_thigh", ph: "00.00" },
//     { label: t("knee"), name: "pant_knee", ph: "00.00" },
//     { label: t("bottom"), name: "pant_bottom", ph: "00.00" },
//   ];

//   const shirtStyles = [
//     t("appleCut"),
//     t("manella"),
//     t("pickCut"),
//     t("shortKurta"),
//     t("longKurta"),
//     t("nehruJacket"),
//     t("threeButton"),
//   ];
//   const pantStyles = [
//     t("narrowBottom"),
//     t("semibaggie"),
//     t("parallel"),
//     t("beltPyjama"),
//     t("nadiButton"),
//   ];

//   const labelStyle = {
//     fontSize: "14px",
//     marginBottom: "4px",
//     fontWeight: "600",
//     color: "#6c757d",
//   };
//   const inputStyle = {
//     fontSize: "16px",
//     padding: "8px 12px",
//     height: "45px",
//     borderRadius: "8px",
//   };

//   return (
//     <div style={{ paddingBottom: "120px" }}>
//       <h6 className="fw-bold mb-3 text-secondary ps-2">{t("newOrder")}</h6>
//       <Form onSubmit={handleSubmit} onKeyDown={handleSmartEnter}>
//         <Row className="g-3">
//           <Col lg={4} md={12}>
//             <Card className="shadow-sm border-0 h-100">
//               <Card.Header className="py-2 px-3 bg-white border-bottom fw-bold text-dark">
//                 <FaUser className="me-2 text-warning" /> {t("customerProfile")}
//               </Card.Header>
//               <Card.Body className="p-3">
//                 <PhotoCapture
//                   onPhotoSelect={handlePhotoSelect}
//                   existingPhoto={formData.photo}
//                 />
//                 <div className="d-flex flex-column gap-3 mt-3">
//                   <div>
//                     <Form.Label style={labelStyle}>{t("fullName")}</Form.Label>
//                     <Form.Control
//                       type="text"
//                       style={inputStyle}
//                       name="full_name"
//                       value={formData.full_name}
//                       onChange={handleChange}
//                       placeholder="Enter Name"
//                     />
//                   </div>
//                   <div>
//                     <Form.Label style={labelStyle}>Village</Form.Label>
//                     <Form.Control
//                       type="text"
//                       style={inputStyle}
//                       name="address"
//                       value={formData.address}
//                       onChange={handleChange}
//                       placeholder="Enter Village"
//                     />
//                   </div>
//                   <div>
//                     <Form.Label style={labelStyle}>{t("mobile")} *</Form.Label>
//                     <Form.Control
//                       type="tel"
//                       style={inputStyle}
//                       name="mobile_no"
//                       value={formData.mobile_no}
//                       onChange={handleChange}
//                       maxLength="10"
//                       placeholder="Enter Mobile no"
//                     />
//                   </div>
//                   <div>
//                     <Form.Label style={labelStyle}>
//                       {t("deadline")} *
//                     </Form.Label>
//                     <Form.Control
//                       type="date"
//                       min={minDate}
//                       style={inputStyle}
//                       name="deadline_date"
//                       value={formData.deadline_date}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <Form.Label style={labelStyle}>Remark / Note</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={3}
//                     style={{ ...inputStyle, height: "auto" }}
//                     name="remark"
//                     value={formData.remark}
//                     onChange={handleChange}
//                     placeholder="Special instructions..."
//                   />
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>

//           <Col lg={4} md={6}>
//             <MeasurementCard
//               title={t("shirt")}
//               icon={<FaTshirt />}
//               fields={shirtFields}
//               styleOptions={shirtStyles}
//               selectedStyles={formData.shirt_selected_styles}
//               onStyleChange={(style, op) =>
//                 handleStyleChange("shirt", style, op)
//               }
//               formData={formData}
//               handleChange={handleChange}
//               onSmartEnter={handleSmartEnter}
//               getRequiredFieldCount={getRequiredFieldCount}
//               selectName="shirt_style_select" // <-- ASSIGNED IDENTIFIER
//             />
//           </Col>
//           <Col lg={4} md={6}>
//             <MeasurementCard
//               title={t("pant")}
//               icon={<FaRulerVertical />}
//               fields={pantFields}
//               styleOptions={pantStyles}
//               selectedStyles={formData.pant_selected_styles}
//               onStyleChange={(style, op) =>
//                 handleStyleChange("pant", style, op)
//               }
//               formData={formData}
//               handleChange={handleChange}
//               onSmartEnter={handleSmartEnter}
//               getRequiredFieldCount={getRequiredFieldCount}
//               selectName="pant_style_select" // <-- ASSIGNED IDENTIFIER
//             />
//           </Col>
//         </Row>

//         <div
//           className="fixed-bottom p-3 bg-white border-top shadow-lg d-flex justify-content-between align-items-center"
//           style={{ zIndex: 1050, left: "260px" }}
//         >
//           <div className="ms-3 d-none d-sm-block">
//             <div
//               className="text-muted small uppercase fw-bold"
//               style={{ fontSize: "10px", letterSpacing: "1px" }}
//             >
//               Order Summary
//             </div>
//             <div className="fw-bold text-dark">
//               {shirtTotal > 0 && (
//                 <span>
//                   {shirtTotal} {t("shirt")}{" "}
//                 </span>
//               )}
//               {shirtTotal > 0 && pantTotal > 0 && (
//                 <span className="mx-2 text-muted">|</span>
//               )}
//               {pantTotal > 0 && (
//                 <span>
//                   {pantTotal} {t("pant")}
//                 </span>
//               )}
//               {shirtTotal === 0 && pantTotal === 0 && (
//                 <span className="text-muted small italic">
//                   No items selected
//                 </span>
//               )}
//             </div>
//           </div>
//           <div
//             className="d-flex gap-2"
//             style={{ width: "auto", minWidth: "350px" }}
//           >
//             <Button
//               type="button"
//               variant="outline-secondary"
//               size="lg"
//               onClick={() => navigate(-1)}
//               style={{ width: "120px" }}
//             >
//               <FaArrowLeft className="me-2" /> {t("back")}
//             </Button>
//             <Button
//               id="saveOrderBtn"
//               type="submit"
//               size="lg"
//               className="text-white fw-bold px-4"
//               style={{ backgroundColor: "#f0a500", border: "none", flex: 1 }}
//             >
//               <FaSave className="me-2" /> {t("save")}
//             </Button>
//           </div>
//         </div>
//       </Form>
//     </div>
//   );
// };
// export default AddCustomer;

import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaTshirt, FaRulerVertical, FaSave, FaArrowLeft } from "react-icons/fa";
import { useLang } from "../context/LangContext";

import { addCustomer, addOrder } from "../services/api";
import { validateForm } from "../utils/validation";
import PhotoCapture from "../components/common/PhotoCapture";
import MeasurementCard from "../components/orders/MeasurementCard";
import { useToast } from "../context/ToastContext";

const AddCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const { showToast } = useToast();

  const minDate = new Date().toISOString().split("T")[0];

  const initialState = {
    full_name: "", mobile_no: "", address: "", photo: null, deadline_date: "",
    shirt_length_regular: "", shirt_length_short: "", shirt_length_long: "",
    shirt_front: "", shirt_shoulder: "", shirt_sleeve: "",
    shirt_collar_cuff: "", shirt_chest: "", shirt_half_sleeves: "",
    shirt_selected_styles: {},
    pant_length: "", pant_below_waist: "", pant_waist: "", pant_thigh: "",
    pant_knee: "", pant_bottom: "", pant_selected_styles: {},
    remark: "", shirt_remark: "", pant_remark: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state && location.state.prefillCustomer) {
      const cust = location.state.prefillCustomer;
      setCurrentCustomerId(cust.customerId);
      
      let newFormData = { 
        ...initialState,
        full_name: cust.fullName || "",
        mobile_no: cust.mobileNo || "",
        address: cust.address || "",
      };

      if (cust.measurements) {
        const m = cust.measurements;
        const cleanNum = (val) => (!val || val === 0 || val === "0" || val === 0.0) ? "" : val;

        if (m.shirtLength) {
          if (m.shirtLength.includes(":")) {
            const parts = m.shirtLength.split(",");
            parts.forEach(p => {
              if (p.includes("Reg:")) newFormData.shirt_length_regular = p.split(":")[1].trim();
              if (p.includes("Short:")) newFormData.shirt_length_short = p.split(":")[1].trim();
              if (p.includes("Long:")) newFormData.shirt_length_long = p.split(":")[1].trim();
            });
          } else {
            newFormData.shirt_length_regular = cleanNum(m.shirtLength);
          }
        }

        newFormData.shirt_front = cleanNum(m.shirtFront);
        newFormData.shirt_shoulder = cleanNum(m.shirtShoulder);
        newFormData.shirt_sleeve = cleanNum(m.shirtSleeve);
        newFormData.shirt_collar_cuff = (!m.shirtCollar || m.shirtCollar === "0") ? "" : m.shirtCollar;
        newFormData.shirt_chest = cleanNum(m.shirtChest);
        newFormData.shirt_half_sleeves = (m.shirtHalfSleeve && /[1-9]/.test(String(m.shirtHalfSleeve))) ? m.shirtHalfSleeve : "";

        newFormData.pant_length = cleanNum(m.pantLength);
        newFormData.pant_below_waist = cleanNum(m.pantBelowWaist);
        newFormData.pant_waist = cleanNum(m.pantWaist);
        newFormData.pant_thigh = cleanNum(m.pantThigh);
        newFormData.pant_knee = cleanNum(m.pantKnee);
        newFormData.pant_bottom = cleanNum(m.pantBottom);
      }
      
      setFormData(newFormData);
    } else {
      const saved = sessionStorage.getItem("addCustomerForm");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.formData) {
            setFormData(parsed.formData);
            setCurrentCustomerId(parsed.currentCustomerId || null);
          } else {
            setFormData(parsed);
          }
        } catch (e) {
          setFormData(initialState);
        }
      } else {
        setFormData(initialState);
        setCurrentCustomerId(null);
      }
    }
  }, [location.state]);

  useEffect(() => {
    sessionStorage.setItem("addCustomerForm", JSON.stringify({ formData, currentCustomerId }));
  }, [formData, currentCustomerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile_no") {
      if (/^\d*$/.test(value) && value.length <= 10) setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoSelect = (file) => setFormData({ ...formData, photo: file });

  const handleStyleChange = (category, styleName, operation) => {
    const key = category === "shirt" ? "shirt_selected_styles" : "pant_selected_styles";
    const currentList = { ...formData[key] };
    const currentQty = currentList[styleName] || 0;

    let newQty = currentQty;
    if (operation === "increment") newQty += 1;
    if (operation === "decrement" && currentQty > 0) newQty -= 1;

    const futureList = { ...currentList };
    if (newQty === 0) delete futureList[styleName];
    else futureList[styleName] = newQty;

    if (operation === "increment" && currentQty === 0 && category === "shirt" && Object.keys(futureList).length > 1) {
        const appendSlash = (val) => val && val.toString().trim() !== "" && !val.toString().trim().endsWith("/") ? val + " / " : val;
        setFormData((prev) => ({ ...prev, shirt_collar_cuff: appendSlash(prev.shirt_collar_cuff) }));
    }

    setFormData((prev) => ({ ...prev, [key]: futureList }));
  };

  const handleSmartEnter = (e) => {
    if (e.key === "Enter") {
      if (e.target.tagName === "SELECT") {
        shiftFocus(e, e.target.name);
        return;
      }
      e.preventDefault();
      const { name, value } = e.target;

      if (name === "shirt_collar_cuff" || name === "shirt_half_sleeves") {
        const currentCount = value.toString().split("/").filter((v) => v.trim() !== "").length;
        if (currentCount < 2) {
          if (!value.toString().trim().endsWith("/")) setFormData((prev) => ({ ...prev, [name]: value + " / " }));
          return;
        }
      }
      shiftFocus(e, name);
    }
  };

  const getTotalQty = (styleObj) => Object.values(styleObj).reduce((a, b) => a + b, 0);

  const shiftFocus = (e, currentFieldName) => {
      const form = e.target.form;

      if (currentFieldName === "shirt_half_sleeves") {
          const pantSelect = document.getElementById("pant_style_select");
          if (pantSelect) pantSelect.focus();
          return;
      }

      if (currentFieldName === "pant_style_select") {
          const pantTotal = getTotalQty(formData.pant_selected_styles);
          if (pantTotal > 0 && form.elements["pant_length"]) form.elements["pant_length"].focus();
          else document.getElementById("saveOrderBtn")?.focus();
          return;
      }

      if (currentFieldName === "pant_bottom") {
          document.getElementById("saveOrderBtn")?.focus();
          return;
      }

      const index = Array.prototype.indexOf.call(form, e.target);
      let nextIndex = index + 1;
      let nextElement = form.elements[nextIndex];

      while (nextElement && (nextElement.type === "button" || nextElement.disabled)) {
        nextIndex++;
        nextElement = form.elements[nextIndex];
      }
      if (nextElement) nextElement.focus();
  };

  const getStyleString = (styleObj) => Object.entries(styleObj).map(([s, q]) => `${s} (${q})`).join(", ");

  const saveToBackend = async () => {
    const validation = validateForm(formData, t);
    if (!validation.isValid) {
      showToast(validation.message, "danger");
      return false;
    }

    const shirtTotal = getTotalQty(formData.shirt_selected_styles);
    const pantTotal = getTotalQty(formData.pant_selected_styles);

    const activeStyles = Object.keys(formData.shirt_selected_styles);
    const hasLong = activeStyles.includes("Long Kurta") || activeStyles.includes(t("longKurta"));
    const hasShort = activeStyles.includes("Short Kurta") || activeStyles.includes(t("shortKurta"));
    const otherStyles = ["Apple Cut", t("appleCut"), "Manella", t("manella"), "Pick Cut", t("pickCut"), "Nehru", t("nehruJacket"), "Three Button", t("threeButton")];
    const hasReg = activeStyles.length === 0 || activeStyles.some(s => otherStyles.includes(s));

    let combinedLengths = [];
    if (hasReg && formData.shirt_length_regular) combinedLengths.push(`Reg: ${formData.shirt_length_regular}`);
    if (hasShort && formData.shirt_length_short) combinedLengths.push(`Short: ${formData.shirt_length_short}`);
    if (hasLong && formData.shirt_length_long) combinedLengths.push(`Long: ${formData.shirt_length_long}`);
    const finalShirtLength = combinedLengths.join(", ");

    let customerIdToUse = currentCustomerId;
    if (!customerIdToUse) {
      customerIdToUse = await addCustomer({
        fullName: formData.full_name, mobileNo: formData.mobile_no, address: formData.address, photoPath: "pending_upload.jpg",
      });
      setCurrentCustomerId(customerIdToUse);
    }

    const orderPayload = {
      customerId: customerIdToUse, deadlineDate: formData.deadline_date, languageReq: "English",
      shirtLength: shirtTotal > 0 ? finalShirtLength : "0",
      shirtCollar: shirtTotal > 0 ? formData.shirt_collar_cuff : "0",
      shirtFront: shirtTotal > 0 ? parseFloat(formData.shirt_front) || 0 : 0,
      shirtShoulder: shirtTotal > 0 ? parseFloat(formData.shirt_shoulder) || 0 : 0,
      shirtSleeve: shirtTotal > 0 ? parseFloat(formData.shirt_sleeve) || 0 : 0,
      shirtChest: shirtTotal > 0 ? parseFloat(formData.shirt_chest) || 0 : 0,
      shirtHalfSleeve: shirtTotal > 0 ? (formData.shirt_half_sleeves || "0") : "0",
      shirtStyle: shirtTotal > 0 ? getStyleString(formData.shirt_selected_styles) : "None",
      shirtQty: shirtTotal,
      pantLength: pantTotal > 0 ? formData.pant_length : "0",
      pantBelowWaist: pantTotal > 0 ? parseFloat(formData.pant_below_waist) || 0 : 0,
      pantWaist: pantTotal > 0 ? parseFloat(formData.pant_waist) || 0 : 0,
      pantThigh: pantTotal > 0 ? parseFloat(formData.pant_thigh) || 0 : 0,
      pantKnee: pantTotal > 0 ? parseFloat(formData.pant_knee) || 0 : 0,
      pantBottom: pantTotal > 0 ? parseFloat(formData.pant_bottom) || 0 : 0,
      pantStyle: pantTotal > 0 ? getStyleString(formData.pant_selected_styles) : "None",
      pantQty: pantTotal,
      remark: formData.remark,
      shirtRemark: shirtTotal > 0 ? formData.shirt_remark : "",
      pantRemark: pantTotal > 0 ? formData.pant_remark : "",
    };

    await addOrder(orderPayload);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return; // Prevent double-submit / multiple saves
    setIsSaving(true);
    try {
      const success = await saveToBackend();
      if (success) {
        showToast(t("orderSavedSuccess"), "success");
        setFormData(initialState);
        setCurrentCustomerId(null);
        sessionStorage.removeItem("addCustomerForm");
        navigate("/");
      }
    } catch (error) {
      const backendMsg = error.response?.data?.message || t("failedToSaveNetwork");
      showToast(backendMsg, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const shirtTotal = getTotalQty(formData.shirt_selected_styles);
  const pantTotal = getTotalQty(formData.pant_selected_styles);

  const activeStyles = Object.keys(formData.shirt_selected_styles);
  const hasLong = activeStyles.includes("Long Kurta") || activeStyles.includes(t("longKurta"));
  const hasShort = activeStyles.includes("Short Kurta") || activeStyles.includes(t("shortKurta"));
  const otherStyles = ["Apple Cut", t("appleCut"), "Manella", t("manella"), "Pick Cut", t("pickCut"), "Nehru", t("nehruJacket"), "Three Button", t("threeButton")];
  const hasReg = activeStyles.length === 0 || activeStyles.some(s => otherStyles.includes(s));

  const dynamicShirtFields = [];
  if (hasReg) dynamicShirtFields.push({ label: t("lengthRegular"), name: "shirt_length_regular", type: "number", ph: "00.00" });
  if (hasShort) dynamicShirtFields.push({ label: t("lengthShort"), name: "shirt_length_short", type: "number", ph: "00.00" });
  if (hasLong) dynamicShirtFields.push({ label: t("lengthLong"), name: "shirt_length_long", type: "number", ph: "00.00" });

  const shirtFields = [
    ...dynamicShirtFields,
    { label: t("front"), name: "shirt_front", ph: "00.00" },
    { label: t("shoulder"), name: "shirt_shoulder", ph: "00.00" },
    { label: t("sleeve"), name: "shirt_sleeve", ph: "00.00" },
    { label: t("collarCuff"), name: "shirt_collar_cuff", type: "text", ph: "00.00 / 00.00" },
    { label: `${t("chest")} ${t("opt")}`, name: "shirt_chest", ph: "00.00" },
    { label: `${t("halfSleeve")} ${t("opt")}`, name: "shirt_half_sleeves", type: "text", ph: "00.00 / 00.00" },
  ];

  const pantFields = [
    { label: t("length"), name: "pant_length", type: "number", ph: "00.00" },
    { label: t("belowWaist"), name: "pant_below_waist", ph: "00.00" },
    { label: t("waist"), name: "pant_waist", ph: "00.00" },
    { label: t("thigh"), name: "pant_thigh", ph: "00.00" },
    { label: t("knee"), name: "pant_knee", ph: "00.00" },
    { label: t("bottom"), name: "pant_bottom", ph: "00.00" },
  ];

  const shirtStyles = [t("appleCut"), t("manella"), t("pickCut"), t("shortKurta"), t("longKurta"), t("nehruJacket"), t("threeButton")];
  const pantStyles = [t("narrowBottom"), t("semibaggie"), t("parallel"), t("beltPyjama"), t("nadiButton")];

  const isReturning = !!currentCustomerId;
  const labelStyle = { fontSize: "14px", marginBottom: "4px", fontWeight: "600", color: "#6c757d" };
  const inputStyle = { fontSize: "16px", padding: "8px 12px", height: "45px", borderRadius: "8px" };
  const readOnlyStyle = isReturning ? { ...inputStyle, backgroundColor: "#e9ecef", cursor: "not-allowed" } : inputStyle;

  return (
    <div style={{ paddingBottom: "120px" }}>
      <h6 className="fw-bold mb-3 text-secondary ps-2">{t("newOrder")}</h6>
      <Form onSubmit={handleSubmit} onKeyDown={handleSmartEnter}>
        <Row className="g-3">
          <Col lg={4} md={12}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="py-2 px-3 bg-white border-bottom fw-bold text-dark">
                <FaUser className="me-2 text-warning" /> {t("customerProfile")}
              </Card.Header>
              <Card.Body className="p-3">
                <PhotoCapture onPhotoSelect={handlePhotoSelect} existingPhoto={formData.photo} />
                <div className="d-flex flex-column gap-3 mt-3">
                  <div>
                    <Form.Label style={labelStyle}>{t("fullName")}</Form.Label>
                    <Form.Control type="text" style={readOnlyStyle} name="full_name" value={formData.full_name} onChange={handleChange} placeholder={t("enterName")} readOnly={isReturning} />
                  </div>
                  <div>
                    <Form.Label style={labelStyle}>{t("village")}</Form.Label>
                    <Form.Control type="text" style={readOnlyStyle} name="address" value={formData.address} onChange={handleChange} placeholder={t("village")} readOnly={isReturning} />
                  </div>
                  <div>
                    <Form.Label style={labelStyle}>{t("mobile")} *</Form.Label>
                    <Form.Control type="tel" style={readOnlyStyle} name="mobile_no" value={formData.mobile_no} onChange={handleChange} maxLength="10" placeholder={t("mobile")} readOnly={isReturning} />
                  </div>
                  <div>
                    <Form.Label style={labelStyle}>{t("deadline")} *</Form.Label>
                    <Form.Control type="date" min={minDate} style={inputStyle} name="deadline_date" value={formData.deadline_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="mt-3">
                  <Form.Label style={labelStyle}>{t("remarkNote")}</Form.Label>
                  <Form.Control as="textarea" rows={3} style={{ ...inputStyle, height: "auto" }} name="remark" value={formData.remark} onChange={handleChange} placeholder={t("specialInstructions")} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6}>
            <MeasurementCard
              title={t("shirt")}
              icon={<FaTshirt />}
              fields={shirtFields}
              styleOptions={shirtStyles}
              selectedStyles={formData.shirt_selected_styles}
              onStyleChange={(style, op) => handleStyleChange("shirt", style, op)}
              formData={formData}
              handleChange={handleChange}
              onSmartEnter={handleSmartEnter}
              selectName="shirt_style_select"
              noteName="shirt_remark"
            />
          </Col>
          <Col lg={4} md={6}>
            <MeasurementCard
              title={t("pant")}
              icon={<FaRulerVertical />}
              fields={pantFields}
              styleOptions={pantStyles}
              selectedStyles={formData.pant_selected_styles}
              onStyleChange={(style, op) => handleStyleChange("pant", style, op)}
              formData={formData}
              handleChange={handleChange}
              onSmartEnter={handleSmartEnter}
              selectName="pant_style_select"
              noteName="pant_remark"
            />
          </Col>
        </Row>

        <div className="fixed-bottom p-3 bg-white border-top shadow-lg d-flex justify-content-between align-items-center" style={{ zIndex: 1050, left: "260px" }}>
          <div className="ms-3 d-none d-sm-block">
            <div className="text-muted small uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>{t("orderSummary")}</div>
            <div className="fw-bold text-dark">
              {shirtTotal > 0 && <span>{shirtTotal} {t("shirt")} </span>}
              {shirtTotal > 0 && pantTotal > 0 && <span className="mx-2 text-muted">|</span>}
              {pantTotal > 0 && <span>{pantTotal} {t("pant")}</span>}
              {shirtTotal === 0 && pantTotal === 0 && <span className="text-muted small italic">{t("noItemsSelected")}</span>}
            </div>
          </div>
          <div className="d-flex gap-2" style={{ width: "auto", minWidth: "350px" }}>
            <Button type="button" variant="outline-secondary" size="lg" onClick={() => navigate(-1)} style={{ width: "120px" }} disabled={isSaving}>
              <FaArrowLeft className="me-2" /> {t("back")}
            </Button>
            <Button id="saveOrderBtn" type="submit" size="lg" className="text-white fw-bold px-4" style={{ backgroundColor: "#f0a500", border: "none", flex: 1 }} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" /> {t("save")}...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> {t("save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
export default AddCustomer;