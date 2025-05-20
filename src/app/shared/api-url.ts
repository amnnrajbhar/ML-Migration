import { environment } from '../../environments/environment';
export class APIURLS {
  // public static BR_BASE_URL: string = "http://localhost:52217/api/";

  //- Microlabs Server
  //    public static BR_BASE_URL: string = "http://192.168.1.188/api/api/";

  //MicroLabs Dev Server
  //    public static BR_BASE_URL: string = "http://192.168.1.134/api/api/";

  //MicroLabs API Url
  public static BR_BASE_URL: string = environment.apiUrl;
  //public static BR_LOGIN_BASE_URL: string = environment.apiLoginUrl;
  //Microlabs Hr API Url
  public static BR_BASE_HR_URL: string = environment.hrapiUrl;

  // public static BR_WMTS_URL: string = environment.WMTSUrl;
  // public static BR_DLS_URL: string =environment.DLSUrl;

  //ITAMS API Url
  public static BR_AMS_URL: string = environment.ITAMSUrl;
  //WMTS URL
  public static BR_WMTS_URL: string = environment.WMTSUrl;

  //DLS API URL
  public static BR_DLS_URL: string = environment.DLSUrl;

  //LA API URL
  public static BR_LA_URL: string = environment.LAUrl;

  public static BR_AUTH_API: string = "Login/token";
  public static BR_HR_URL: string = environment.HRUrl;


  public static BR_COMPETENCY: string = "CompetencyMaster/GetAll";
  public static BR_COMPETENCYMASTER_GETALL: string = "CompetencyMaster/GetAll";
  public static BR_COMPETENCY_INSERT: string = "CompetencyMaster";
  public static BR_MASTER_CALENDAR_ID_API: string = "CalendarMaster/GetByAny";
  public static BR_MASTER_NEW_SALARY_BREAKUP_API = "NewSalaryBreakup/GetByAny";
  public static BR_MASTER_NEW_SALARY_BREAKUP_ALL_API = "NewSalaryBreakup/GetAll";
  public static BR_MASTER_NEW_SALARY_BREAKUP_POST_API = "NewSalaryBreakup";
  public static BR_MASTER_VISITOR_API = "Visitor/GetByAny";
  public static BR_MASTER_VISITOR_ALL_API = "Visitor/GetAll";
  public static BR_MASTER_VISITOR_POST_API = "Visitor";
  public static BR_MASTER_VISITOR_BYPARAM_API = "Visitor/GetByParam";


  public static BR_MASTER_VISITORS_IMAGE_POST_API = "VisitorsImage";
  public static BR_MASTER_VISITORS_IMAGE_ANY_API = "VisitorsImage/GetByAny";

  public static BR_MASTER_ADDITIONAL_VISITOR_POST_API = "AdditionalVisitors";
  public static BR_MASTER_ADDITIONAL_VISITOR_ALL_API = "AdditionalVisitors/GetAll";
  public static BR_MASTER_ADDITIONAL_VISITOR_ANY_API = "AdditionalVisitors/GetByAny";


  public static BR_MASTER_VISITOR_BELONGINGS_ALL_API = "VisitorBelonging/GetAll";
  public static BR_MASTER_VISITOR_PURPOSE_ALL_API = "VisitorPurpose/GetAll";
  public static BR_MASTER_VISITOR_TYPE_ALL_API = "VisitorType/GetAll";
  public static BR_MASTER_LOCATION_MASTER_ALL_API = "LocationMaster/GetAll";
  public static BR_LOCATIONMASTER_GETASSIGNEDPLANTS = "LocationMaster/GetAssignedPlants";
  public static BR_MASTER_LOCATION_MASTER_API = "LocationMaster";
  public static BR_MASTER_PASSWORDPOLICY_ALL_API = "PasswordPolicy/GetAll";
  public static BR_MASTER_PASSWORDPOLICY_API = "PasswordPolicy";

  public static BR_MASTER_SUPPLIER_MASTER_ALL_API = "SupplierMaster/GetAll";
  public static BR_MASTER_SUPPLIER_MASTER_API = "SupplierMaster";

  public static BR_MASTER_MATERIALTYPE_MASTER_ALL_API = "MaterialType/GetAll";
  public static BR_MASTER_MATERIALTYPE_GETBYPARAM_API = "MaterialType/GetByParam";
  public static BR_MASTER_MATERIALTYPE_GETUNIQUETYPE_API = "MaterialType/GetDistinctType";
  public static BR_MASTER_UOM_MASTER_ALL_API = "UOMMaster/GetAll";
  public static BR_MASTER_UOM_PUT_API = "UOMMaster";

  public static BR_MASTER_LOCATIONGATE_MASTER_ALL_API = "LocationGateMaster/GetAll";
  public static BR_MASTER_LOCATIONGATE_MASTER_ANY_API = "LocationGateMaster/GetByAny";
  public static BR_MASTER_LOCATIONGATE_MASTER_API = "LocationGateMaster";

  public static BR_MASTER_GEPOIN_API = "GePoIn/GetAll";
  public static BR_MASTER_GEPOIN_POST_API = "GePoIn";
  public static BR_MASTER_GEPOIN_ANY_API = "GePoIn/GetByAny";

  public static BR_MASTER_GATEOUTWARDM_ALL_API = "GateOutwardM/GetAll";
  public static BR_MASTER_GATEOUTWARDM_ANY_API = "GateOutwardM/GetByAny";
  public static BR_MASTER_GATEOUTWARDM_PARAM_API = "GateOutwardM/GetByParam";
  public static BR_MASTER_GATEOUTWARDM_POST_API = "GateOutwardM";
  public static BR_MASTER_GATEOUTWARDM_LASTGO_API = "GateOutwardM/GetLastGONum";
  public static BR_MASTER_GATEOUTWARDM_OINV_POST_API = "GateOutwardM/OutInvoiceCreate";
  public static BR_MASTER_GATEOUTWARDM_OTHERMATERIAL_API = "GateOutwardM/OtherMaterialCreate";
  public static BR_MASTER_GATEOUTWARDM_SUBCONTRACT_API = "GateOutwardM/SubContractCreate";
  public static BR_MASTER_GATEOUTWARDM_FILTER_API = "GateOutwardM/GetOutwardEntryByFilter";
  public static BR_MASTER_GATEOUTWARDM_REGISTER_API = "GateOutwardM/GetOutwardRegister";
  public static BR_GE_RETURN_CLOSURE_REPORT_API = "GateOutwardM/GEReturnableClosureReport";
  public static BR_GE_SUBCONTRACT_REPORT_API = "GateOutwardM/GESubContractReport";

  public static BR_MASTER_GATEOUTWARDD_ALL_API = "GateOutwardD/GetAll";
  public static BR_MASTER_GATEOUTWARDD_ANY_API = "GateOutwardD/GetByAny";
  public static BR_MASTER_GATEOUTWARDD_POST_API = "GateOutwardD";

  public static BR_MASTER_GATEINWARDM_LASTGI_API = "GateEntryM/GetLastGINum";
  public static BR_MASTER_GATEINWARDM_GETGEGATEPO_API = "GateEntryM/GetGateEntryPO";
  public static BR_MASTER_GATEINWARDM_REGISTER_API = "GateEntryM/GateInwardRegister";
  public static BR_MASTER_GATEINWARDM_ALL_API = "GateEntryM/GetAll";
  public static BR_MASTER_GATEINWARDM_ANY_API = "GateEntryM/GetByAny";
  public static BR_MASTER_GATEINWARDM_PARAM_API = "GateEntryM/GetByParam";
  public static BR_MASTER_GATEINWARDM_POST_API = "GateEntryM";
  public static BR_MASTER_GATEINWARDM_STO_POST_API = "GateEntryM/STOCreate";
  public static BR_MASTER_GATEINWARDM_RMAT_POST_API = "GateEntryM/ReturnableMatCreate";

  public static BR_MASTER_GATEINWARDD_ALL_API = "GateEntryD/GetAll";
  public static BR_MASTER_GATEINWARDD_ANY_API = "GateEntryD/GetByAny";
  public static BR_MASTER_GATEINWARDD_PARAM_API = "GateEntryD/GetByParam";
  public static BR_MASTER_GATEINWARDD_POST_API = "GateEntryD";
  public static BR_MASTER_GATEINWARDD_VALRECQTY_API = "GateEntryD/ValidateReceivedQty";

  public static BR_MASTER_GEPODETAILS_POST_API = "GetPODetails/GetByParam";
  public static BR_MASTER_GEPOMATERIALIN_POST_API = "GetPODetails";
  public static BR_MASTER_GEPOMATERIALIN_ANY_API = "GetPODetails/GetByAny";

  public static BR_MASTER_GETINVOICEMASTER_PARAM_API = "GetInvoiceDetails/GetByParam";


  public static BR_DESIGNATION_API: string = "DesignationMaster/GetAll";
  public static BR_DESIGNATION_INSERT_API: string = "DesignationMaster";

  public static BR_DESIGNATION_HR_API: string = "DesignationHRMaster/GetAll";
  public static BR_DESIGNATION_HR_INSERT_API: string = "DesignationHRMaster";


  public static BR_EMPLOYEEMASTER_API: string = "EmployeeMaster";
  public static BR_EMPLOYEEMASTER_API_GET: string = "EmployeeMaster/GetAll";
  public static BR_EMPLOYEEMASTER_All_API: string = "EmployeeMaster/GetAllWithData";
  public static BR_EMPLOYEEMASTER_GET_All_API: string = "EmployeeMaster/GetActiveEmployees";

  public static BR_EMPLOYEEMASTER_GETBY_ANY_API: string = "EmployeeMaster/GetByAny";

  public static BR_EMPLOYEEMASTER_BYPARAM_API = "EmployeeMaster/GetByParam";
  public static BR_EMPLOYEEMASTER_GETEMPLOYEES = "EmployeeMaster/GetEmployees";
  public static BR_KRACURRENTYEAR_API: string = "KraCurrentYear";
  public static BR_KRACURRENTYEAR_GET_API: string = "KraCurrentYear/GetAll";
  public static BR_KRACURRENTYEAR_GETANY_API: string = "KraCurrentYear/GetByAny";
  public static BR_KRANEXTYEAR_GETANY_API: string = "KraNextYear/GetByAny";
  public static BR_DETAIL_APPRAISAL_API = "AppraisalDetails/GetAll";
  public static BR_DETAIL_APPRAISAL_POST_API = "AppraisalDetails";
  public static BR_DETAIL_APPRAISAL_ANY_API = "AppraisalDetails/GetByAny";
  public static BR_MASTER_EMPLOYEEOTHERDETAILS_GET_API = "EmployeeOtherDetails/GetAll";
  public static BR_APPROVALTEMPLATE_API: string = "ApprovalTemplate/GetAll";
  public static BR_MASTER_PROFILE_FORM_MAINT_API = "ProfileFormMaintenance/GetAll";
  public static BR_MASTER_EMPLOYEEPAYROLL_API = "EmployeePayroll";
  public static BR_MASTER_EMPLOYEEPAYROLL_API_ALL = "EmployeePayroll/GetAll";
  public static BR_MASTER_PROFILE_FORM_MAINT_API_BYID = "ProfileFormMaintenance";

  public static BR_MASTER_ENTITY_API: string = "entity";
  public static BR_INVOICE_SEARCH_API: string = "SearchInvoice";
  public static BR_RINVOICE_SEARCH_API: string = "SearchRInvoice";
  public static BR_INVOICE_APPROVE_API: string = "ApproveInvoice";
  public static BR_INVOICE_API: string = "Invoice";
  public static BR_RINVOICE_API: string = "Purchase";
  public static BR_INVOICE_APPROVEPURCHASE_API: string = "ApprovePurchaseInv";
  public static BR_MASTER_DIVISION_API: string = "division";
  public static BR_FORGOTPASSWORD_API: string = "forgotpassword";
  public static BR_DD_CUSTOMER_API: string = "DDCustomer";
  public static BR_DD_DIVISION_API: string = "DDDivision"
  public static BR_DD_USERDIVISION_API: string = "UserDivision";
  public static BR_DD_USER_API: string = "DDUser";
  public static BR_DD_ENTITY_API: string = "DDEntity";
  public static BR_Master_CUSTOMER_API: string = "Customer";
  public static BR_MASTER_PRODUCT_API: string = "product";
  public static BR_MASTER_SUPPLIER_API: string = "supplier";
  public static BR_MASTER_CUSTOMER_API: string = "customer";


  public static BR_MASTER_STATE_API: string = "StateMaster/GetAll";
  public static BR_MASTER_STATE_API_INSERT: string = "StateMaster";
  public static BR_MASTER_USER_API: string = "UserMaster/GetAll";
  // public static BR_MASTER_GET_USER_API: string = "user";
  public static BR_DASHBOARD_EXCEL_REPORT = "DashboardExcel";
  public static BR_DASHBOARD_DATA = "Dashboard";
  public static BR_REPORT_API = "Report";
  public static BR_DIVREPORT_API = "DivReport";
  public static BR_MASTER_COMPANY_API = "CompanyMaster";
  public static BR_MASTER_COMPANY_ALL_API = "CompanyMaster/GetAll";
  public static BR_MASTER_FORM_API = "FormMaster/GetAll";
  public static BR_MASTER_FORM_API_BYID = "FormMaster";
  public static BR_MASTER_FORM_INSERT_API = "FormMaster";
  public static BR_MASTER_ROLE_API = "SubRoles/GetAll";
  public static BR_MASTER_ROLE_API_BYID = "SubRoles";
  public static BR_MASTER_SBU_All = "SbuMaster/GetAll";
  public static BR_MASTER_SBU = "SbuMaster";
  public static BR_MASTER_VISITORTYPE = "VisitorType";
  public static BR_MASTER_VISITORTYPE_ALL = "VisitorType/GetAll";
  public static BR_MASTER_VISITORBELONGING_ALL = "VisitorBelonging/GetAll";
  public static BR_MASTER_VISITORBELONGING = "VisitorBelonging";

  public static BR_MASTER_PURPOSE_ALL = "VisitorPurpose/GetAll";
  public static BR_MASTER_PURPOSE = "VisitorPurpose";

  public static BR_MASTER_APPROVAL_All = "ApprovalTemplate/GetAll";
  public static BR_MASTER_ERRORMASTER_All = "ErrorMaster/GetAll";
  public static BR_MASTER_NEXTYEARKRA_API = "KraNextYear";
  public static BR_MASTER_NEXTYEARKRA_ANY_API = "KraNextYear/GetByAny";
  public static BR_MASTER_EMPLOYEEADDRESS_API: string = "EmployeeAddress";
  public static BR_MASTER_EMPLOYEEOTHERDETAILS_API: string = "EmployeeOtherDetails";
  public static BR_MASTER_EMPLOYEEOTHERDETAILS_GETBYID: string = "EmployeeOtherDetails";
  public static BR_MASTER_USERMASTER_API: string = "UserMaster";
  public static BR_MASTER_PROJECTMASTER_API: string = "ProjectMaster/GetAll";
  public static BR_MASTER_BELLCURVE_API: string = "BellCurve";
  public static BR_MASTER_EMPLOYEEVIEWDASHBOARD_API: string = "EmployeeViewPage";
  public static BR_MASTER_MANAGERVIEWDASHBOARD_API: string = "ManagerViewPage";
  public static BR_MASTER_SBUVIEWDASHBOARD_API: string = "SbuViewPage";
  public static BR_MASTER_HRVIEWDASHBOARD_API: string = "HrViewPage";
  public static BR_MASTER_RMVIEWDASHBOARD_API: string = "RmViewPage";

  public static BR_MASTER_SUBSBUVIEWDASHBOARD_API: string = "CompetencyViewPage";
  public static BR_MASTER_BELLCURVE_GETBYANY_API: string = "BellCurve/GetByAny";
  public static BR_MASTER_APPROVALTEMPLATE_API: string = "ApprovalTemplate";
  public static BR_MASTER_APPROVALTEMPLATE_API_ALL: string = "ApprovalTemplate/GetAll";

  public static BR_MASTER_CALENDAR_API: string = "CalendarMaster/GetAll";

  public static BR_MASTER_MATERIALTYPE_ALL_API: string = "MaterialType/GetAll";
  public static BR_MASTER_MATERIALTYPE_PUT_API: string = "MaterialType";

  public static BR_MASTER_MATERIAL_GETBYPARAM_API = "Material/GetByParam";
  public static BR_MASTER_MATERIAL_ALL_API: string = "Material/GetAll";
  public static BR_MASTER_MATERIAL_POST_PUT_API: string = "Material";

  public static BR_MASTER_COMPANY_API_ID: string = "CompanyMaster";
  public static BR_MASTER_BELLCURVE_MASTER_DATA_API_ID: string = "BellCurveMaster/GetAll";
  public static BR_MASTER_BELLCURVE_MASTER_API_ID: string = "BellCurveMaster";

  public static BR_AUDITLOG_API = "AuditLog";
  public static BR_AUDITLOG_ALL_API = "AuditLog/GetAll";
  public static BR_AUDITLOG_GetBYANY_API = "AuditLog/GetByAny";
  public static BR_AUDITLOG_GetBYPARAM_API = "AuditLog/GetByParam";
  public static BR_AUDITLOG_AUDITLOGREPORT_API = "AuditLog/GetAuditReportByFilter";


  public static BR_FILEDOWNLOAD_API = "FileDownload";

  public static BR_VMS_FILEDOWNLOAD_API = "VMSFileDownload";

  public static BR_MASTER_DEPARTMENT_API = "DepartmentMaster/GetAll";
  public static BR_MASTER_DEPARTMENT_BYID_API = "DepartmentMaster";
  public static BR_MASTER_DEPARTMENT_PAGED_API = "DepartmentMaster/GetPaged?page=";

  public static BR_MASTER_SUBDEPARTMENT_API = "SubDeptMaster/GetAll";
  public static BR_MASTER_SUBDEPARTMENT_BYID_API = "SubDeptMaster";
  public static BR_MASTER_SUBDEPARTMENT_PAGED_API = "SubDeptMaster/GetPaged?page=";

  public static BR_MASTER_EMAILTEMPLATE_ALL_API = "EmailTemplate/GetAll";
  public static BR_MASTER_SENDEMAIL_API = "Email";
  public static BR_SENDGUESTHOUSEEMAIL_API = "Email/sendguesthousemail";
  public static BR_SENDMEETINGEMAIL_API = "Email/sendmeetingmail";
  public static BR_SEND_CABREQUEST_EMAIL_API = "Email/sendcabrequestmail";
  public static BR_MASTER_FORGOTSENDEMAIL_API = "ForgotEmail";
  public static BR_MASTER_EMAILTEMPLATE_API = "EmailTemplate";
  public static BR_MASTER_FILEUPLOAD_API: string = "FileUpload";
  public static BR_MASTER_PROJECT_DATA_API = "ProjectMaster/GetAll";
  public static BR_MASTER_PROJECT_API = "ProjectMaster";
  public static BR_MASTER_ASSESMENT_DATA_API = "AssesmentMaster/GetAll";
  public static BR_MASTER_ASSESMENT_DATA_ANY_API = "AssesmentDetail/GetByAny";
  public static BR_MASTER_ASSESMENT_MASTER_DATA_ANY_API = "AssesmentMaster/GetByAny";
  public static BR_MASTER_ASSESMENT_API = "AssesmentMaster";
  public static BR_MASTER_ASSESSMENT_DETAILS_API = "AssesmentDetail";
  public static BR_MASTER_OVERALLRATING_DATA_API = "OverallRatingMaster/GetAll";
  public static BR_MASTER_OVERALLRATING_API = "OverallRatingMaster";
  public static BR_DETAILS_OVERALLRATING_API = "OverallRatingDetails/GetAll";
  public static BR_DETAILS_ANY_OVERALLRATING_API = "OverallRatingDetails/GetByAny";
  public static BR_DETAILS_PUT_OVERALLRATING_API = "OverallRatingDetails";
  public static BR_DETAILS_ANY_TRAINING_API = "TrainingDetail/GetByAny";
  public static BR_DETAILS_TRAINING_API = "TrainingDetail/GetAll";
  public static BR_DETAILS_PUT_TRAINING_API = "TrainingDetail";
  public static BR_MASTER_RATING_DATA_API = "RatingMaster/GetAll";
  public static BR_MASTER_RATING_API = "RatingMaster";
  public static BR_MASTER_SOFTSKILL_DATA_API = "SoftSkillMaster/GetAll";


  public static BR_MASTER_SOFTSKILL_API = "SoftSkillMaster";
  public static BR_MASTER_SOFTSKILL_GET_BY_API = "SoftSkillMaster/GetByAny";

  public static BR_MASTER_DEPARTMENT_API_INSERT = "DepartmentMaster";
  public static BR_MASTER_PROFILE_API = "ProfileMaster/GetAll";
  public static BR_MASTER_PROFILE_API_BYID = "ProfileMaster";
  public static BR_MASTER_PROFILEFORMMAIN_API = "GetForms";
  public static BR_MASTER_GETFORMSFROMPROFILES = "GetFormsFromProfiles";
  public static BR_INVOICE_SEARCHDRCR_API: string = "SearchDrCr";
  public static BR_INV_DEBITCREDIT_API: string = "DebitCredit";
  public static BR_MASTER_USRIMG_API: string = "UserMaster/GetAll";
  // public static BR_MASTER_FILEUPLOAD_API: string = "FileUpload";
  public static BR_MASTER_FILTERDIV_API: string = "FilterDiv";
  public static BR_MASTER_FEEDBACK_API: string = "FeedbackMaster";
  public static BR_MASTER_FEEDBACK_API_GETALL: string = "FeedbackMaster/GetAll";
  public static BR_MASTER_FEEDBACK_API_GETBYANY: string = "FeedbackMaster/GetByAny";
  public static BR_MASTER_MSGBOARD_API: string = "MessageBoard";
  public static BR_MASTER_DISPLAYMSGBOARD_API: string = "MessageBoard/GetAll";
  public static BR_MASTER_DISPLAYMSGBOARD__GETALLDATA_API: string = "MessageBoard/GetAllWithData";
  public static BR_DASHBOARD_FEEDBACK_API: string = "DashboardFeedback";
  public static BR_INV_GS_PRODLIST_API: string = "GSInvProductList";
  public static BR_MASTER_CALENDAR_LL_API: string = "CalendarMaster/GetAllWithData";
  public static BR_MASTER_CALENDAR_INSERT_API: string = "CalendarMaster";
  public static BR_DASHBOARDFILTER_DATA_API: string = "DashboardFilter";
  public static BR_SEARCH_DRCRINVOICE_API: string = "SearchDrCrInvoice";
  public static BR_SEARCH_DRCRPURCHASE_API: string = "SearchDrCrPurchase";
  public static BR_APPROVE_DRCR_API: string = "ApproveDrcr";
  public static BR_FORM_DATA_API: string = "MastersStructureInput/GetAll";
  public static BR_APP_INV_STRUCTURE_API: string = "AppInvoiceStructure";
  public static BR_RESET_PASSWORD_API: string = "ResetPassword";
  public static BR_MASTER_PRICE_LIST_API: string = "PriceList";
  public static BR_MASTER_INV_FOR_PRICE_LIST_API: string = "PriceListForInv";
  public static BR_SUPPLIER_INVOICE_SEARCH_API: string = "SearchSupplierInvoice";
  public static BR_SUPPLIER_INVOICE_APPROVE_API: string = "ApproveSupplierInv";
  public static BR_SUPPLIER_INVOICE_API: string = "SupplierInvoice";
  public static BR_MASTER_COLLECTION_API: string = "Collection";
  public static BR_MASTER_PAYMENT_API: string = "Payment";
  public static BR_MASTER_EXPENSE_API: string = "Expense";
  public static BR_MASTER_EXPENSE_ENTRY_API: string = "ExpenseEntry";
  public static BR_PAYMENT_ADV_API: string = "PaymentAdvance";
  public static BR_UPLOAD_COMPANY_LOGO_API: string = "UploadLogo";
  public static BR_MASTER_CUST_PRICE_LIST_API: string = "CustPriceList";
  public static BR_MASTER_INV_FOR_CUST_PRICE_LIST_API: string = "CustPriceListForInv";
  public static BR_UOM_CODE_API: string = "UomCode";
  public static BR_MASTER_TAILOR_API: string = "Tailor";
  public static BR_SC_MASTER_CUSTOMER_API: string = "Sc_CustMasters";
  public static BR_SC_MASTER_SALESPERSON_API: string = "Sc_SalesPersonMasters";
  public static BR_MASTER_MEASUREMENT_API: string = "Measurement";
  public static BR_MASTER_SC_CUSTINV_API: string = "Sc_CustInv";
  public static BR_MASTER_SC_SUPINV_API: string = "Sc_SupInv";
  public static BR_MASTER_SC_ORDER_TYPE_API: string = "Sc_OrderType";
  public static BR_MASTER_SC_SEARCH_CUSTINV_API: string = "Sc_SearchCustInv";
  public static BR_MASTER_SC_SEARCH_SUPINV_API: string = "Sc_SearchSupInv";
  public static BR_TAILOR_INVOICE_SAVE_API: string = "Sc_TailorInvoice";
  public static BR_TAILOR_REPORTS_API: string = "Sc_TailorReport";
  public static BR_SC_PAYMENT_COLLECTION_API: string = "Sc_CustOrderPayment";
  public static BR_SC_INV_PRODUCT_LIST_API: string = "Sc_GetInvProductList";
  public static BR_SC_MASTER_PRODUCT_API: string = "Sc_Product";
  public static BR_INVOICEMAIL_API: string = "InvoiceMail";
  public static BR_SUPINVOICEMAIL_API: string = "SupInvoiceMail";
  public static BR_CUSTINVOICEMAIL_API: string = "Sc_CustInvMail";

  //Meeting Room,Cab,Guest house API's
  public static BR_MASTER_ROOMTYPE_API = "RoomTypeMaster";
  public static BR_MASTER_ROOMTYPE_ALL_API = "RoomTypeMaster/GetAll";
  public static BR_MASTER_ROOM_FACILITY_API = "RoomFacilityMaster";
  public static BR_MASTER_ROOM_FACILITY_ALL_API = "RoomFacilityMaster/GetAll";
  public static BR_ROOM_MASTER_API = "RoomMaster";
  public static BR_ROOM_MASTER_ALL_API = "RoomMaster/GetAll";
  public static BR_ROOM_MASTER_GetBYANY_API = "RoomMaster/GetByAny";
  public static BR_ROOM_FACILITIES_API = "RoomFacilities";
  public static BR_ROOM_FACILITIES_GetBYANY_API = "RoomFacilities/GetByAny";
  public static BR_ROOM_FACILITIES_ALL_API = "RoomFacilities/GetAll";
  public static BR_ROOM_PICTURES_API = "RoomPictures";
  public static BR_ROOM_PICTURES_GetBYANY_API = "RoomPictures/GetByAny";
  public static BR_ROOM_IMAGEUPLOAD_API = "ImageUpload";
  public static BR_BOOK_PURPOSE_MASTER_API = "BookPurposeMaster";
  public static BR_BOOK_PURPOSE_MASTER_ALL_API = "BookPurposeMaster/GetAll";
  public static BR_ROOM_BOOKING_API = "RoomBooking";
  public static BR_ROOM_BOOKING_ALL_API = "RoomBooking/GetAll";
  public static BR_ROOM_BOOKING_GetBYANY_API = "RoomBooking/GetByAny";
  public static BR_ROOM_BOOKINGPARTICIPANTS_API = "BookingParticipants";
  public static BR_ROOM_BOOKINGPARTICIPANTS_ALL_API = "BookingParticipants/GetAll";
  public static BR_ROOM_BOOKING_BY_FILTER_API = "RoomBooking/GetALLRoomBookingsByFilter"
  public static BR_CAB_BOOKING_API = "CabBooking";
  public static BR_CAB_BOOKING_BY_FILTER_API = "CabBooking/GetALLCabBookingsByFilter"

  public static BR_GUESTHOUSE_MASTER_API = "GuestHouseMaster";
  public static BR_GUESTHOUSE_MASTER_ALL_API = "GuestHouseMaster/GetAll";
  public static BR_GUESTHOUSE_MASTER_GetBYANY_API = "GuestHouseMaster/GetByAny";
  public static BR_GUESTHOUSE_FACILITIES_API = "GuestHouseFacilities";
  public static BR_GUESTHOUSE_FACILITIES_GetBYANY_API = "GuestHouseFacilities/GetByAny";
  public static BR_GUESTHOUSE_FACILITIES_ALL_API = "GuestHouseFacilities/GetAll";
  public static BR_GUESTHOUSE_PICTURES_API = "GuestHousePictures";
  public static BR_GUESTHOUSE_PICTURES_GetBYANY_API = "GuestHousePictures/GetByAny";
  public static BR_GUESTHOUSE_IMAGEUPLOAD_API = "GuestHouseImageUpload";
  public static BR_GUESTHOUSE_BOOKING_API = "GuestHouseBooking";
  public static BR_GUESTHOUSE_BOOKING_ALL_API = "GuestHouseBooking/GetAll";
  public static BR_GUESTHOUSE_BOOKING_GetBYANY_API = "GuestHouseBooking/GetByAny";
  public static BR_GUESTHOUSE_BOOKINGPARTICIPANTS_API = "GuestHouseBookingParticipants";
  public static BR_GUESTHOUSE_BOOKINGPARTICIPANTS_ALL_API = "GuestHouseBookingParticipants/GetAll";
  public static BR_GUESTHOUSE_BOOKING_BY_FILTER_API = "GuestHouseBooking/GetALLGuestHouseBookingsByFilter"
  public static BR_GUESTHOUSE_LOCATION_ALL_API = "GuestHouseLocation/GetAll";
  public static BR_GUESTHOUSE_LOCATION_API = "GuestHouseLocation";
  public static BR_GUESTHOUSE_MASTER_BY_FILTER_API = "GuestHouseMaster/GetALLGuestHouseByFilter";

  //RFC BAPI CALLS
  public static BR_RFCBAPI_GETGE_STO_SALES_INFO_API = "GetGESTODetails";
  public static BR_RFCBAPI_GETGE_SC_INFO_API = "GetSubContractDetails";
  public static BR_RFCBAPI_GETGEPOINFO_API = "GetGEPODetails";
  public static BR_RFCBAPI_CREATEGEPO_API = "CreateGEPO";
  public static BR_RFCBAPI_DELETEGEPO_API = "DeleteGEPO";


  public static BR_MASTER_USER_PLANT_MAINT_API = "UserPlantMaintenance/GetAll";
  public static BR_MASTER_USER_PLANT_MAINT_API_BYID = "UserPlantMaintenance";
  public static BR_MASTER_USER_PLANT_MAINT_API_ANY = "UserPlantMaintenance/GetByAny";


  //PasswordValidate
  public static BR_VALIDATE_PASSWORD_API: string = "Users";

  //RA
  public static BR_MASTER_RA_REQUEST_API = "RaRequest/GetAll";
  public static BR_RA_REQUEST_INSERT_API = "RaRequest";
  public static BR_RA_REQUEST_GET_BY_FILTER_API = "RaRequest/GetRARequestByFilter";
  public static BR_MASTER_RA_GRADE_API = "RaGrade/GetAll";
  public static BR_MASTER_DOCUMENTS_API = "Documents/GetAll";
  public static BR_MASTER_API_MANUFACTURER_API = "ApiManufacturer/GetAll";
  public static BR_MASTER_API_MASTER_API = "ApiMaster/GetAll";

  public static BR_SEND_RA_REQUEST_EMAIL_API = "Email/RaRequest";
  public static BR_SEND_RA_PROVIDE_EMAIL_API = "Email/RaProvide";


  public static BR_MASTER_COUNTRY_ALL_API: string = "Country/GetAll";

  //job work bapi
  public static BR_RFCBAPI_GET_VENDOR_DETAILS_API = "GetVendorMasterDetails";
  public static BR_RFCBAPI_GET_ITEM_DETAILS_API = "GetMaterialMasterDetails";
  //JOBWORK
  public static BR_JOB_WORK_API: string = "JobWorkM/GetAll";
  public static BR_JOB_WORK_INSERT_API: string = "JobWorkM";
  public static BR_JOB_WORK_FILTER_DATA_API: string = "JobWorkM/GetFilteredData";
  public static BR_MASTER_VENDOR_GETBYPARAM_API = "VendorMasterDetails/GetByParam";
  public static BR_MASTER_VENDOR_ALL_API: string = "VendorMasterDetails/GetAll";
  public static BR_MASTER_VENDOR_POST_PUT_API: string = "VendorMasterDetails";
  public static BR_JOB_WORK_REPORT_DATA_API: string = "JobWorkM/GetReportData";


  //MS&NPD
  public static BR_MED_SERVICE_BRAND_API: string = "MedServiceBrand/GetAll";
  public static BR_MED_SERVICE_BRAND_INSERT_API: string = "MedServiceBrand";

  public static BR_MED_SERVICE_CATEGORY_API: string = "MedInputCategory/GetAll";
  public static BR_MED_SERVICE_CATEGORY_INSERT_API: string = "MedInputCategory";

  public static BR_MED_SERVICE_REQUEST_API: string = "MediServiceRequest/GetAll";
  public static BR_MED_SERVICE_REQUEST_INSERT_API: string = "MediServiceRequest";
  public static BR_MED_SERVICE_REQUEST_APPROVER_API: string = "MediServiceRequest/GetApprover";
  public static BR_MED_SERVICE_REQUEST_FILTER_API: string = "MediServiceRequest/GetMedRequestByFilter";
  public static BR_MED_SERVICE_REQUEST_MASSAPPROVE_API: string = "MediServiceRequest/MassApprove";
  public static BR_MED_SERVICE_REQUEST_SENDMAIL_API: string = "MediServiceRequest/SendMail";
  public static BR_MED_SERVICE_MEDCODE_DETAILS_API: string = "MediServiceRequest/GetMedCodeData";
  public static BR_MEDISERVICEREQUEST_GETMSREQUESTSFORDASHBOARD: string = "MediServiceRequest/GetMSRequestsForDashboard";

  public static BR_MED_SERVICE_APPROVER_SENDMAIL_API: string = "MediServiceRequest/SendMailtoApprover";
  public static BR_MED_SERVICE_REVERT_SENDMAIL_API: string = "MediServiceRequest/SendRevertMail";
  public static BR_MED_SERVICE_REJECT_SENDMAIL_API: string = "MediServiceRequest/SendRejectMail";


  public static BR_MED_SERVICE_HISTORY_API: string = "MedServiceRequestHistory/GetByParam";
  public static BR_MED_SERVICE_HISTORY_INSERT_API: string = "MedServiceRequestHistory";

  public static BR_MED_HEAD_APPROVERS_LIST_API: string = "MedHeadApprovers/GetAll";
  public static BR_MED_HEAD_REVIEWERS_LIST_API: string = "MedHeadApprovers/GetReviewer";

  public static BR_NPD_REQUEST_GET_ALL_API: string = "NpdMasterDetails/GetAll";
  public static BR_NPD_REQUEST_INSERT_API: string = "NpdMasterDetails";


  public static BR_NPD_APPROVERS_GET_ALL_API: string = "NpdApprovers/GetAll";
  public static BR_NPD_REQUEST_HOD_INSERT_API: string = "NpdHodDetails";
  public static BR_NPD_REQUEST_CMD_INSERT_API: string = "NpdCmdDetails";
  public static BR_NPD_REQUEST_CQA_INSERT_API: string = "NpdCqaDeptDetails";
  public static BR_NPD_REQUEST_DIST_INSERT_API: string = "NpdDistributionDeptDetails";
  public static BR_NPD_REQUEST_IPR_INSERT_API: string = "NpdIprDeptDetails";
  public static BR_NPD_REQUEST_MED_INSERT_API: string = "NpdMedicalDeptDetails";
  public static BR_NPD_REQUEST_RND_INSERT_API: string = "NpdRndDeptDetails";
  public static BR_NPD_REQUEST_STRAT_INSERT_API: string = "NpdStrategicDeptDetails";
  public static BR_NPD_REQUEST_SCM_INSERT_API: string = "NpdSupplychainDeptDetails";
  public static BR_NPD_REQUEST_CMPBRAND_INSERT_API: string = "NpdCompetitorBrands";
  public static BR_NPD_REQUEST_FILTER_API: string = "NpdMasterDetails/GetNPDRequestByFilter";
  public static BR_NPD_REQUEST_SENDMAIL_API: string = "NpdMasterDetails/SendMail";
  public static BR_NPD_REQUEST_REVERT_API: string = "NpdMasterDetails/RevertRequest";
  public static BR_MED_SERVICE_MASTER_DUMP_API: string = "MediServiceRequest/GetMasterDump";

  public static BR_MASTER_MED_FILEUPLOAD_API: string = "MedFileUpload";
  public static BR_MASTER_NPD_FILEUPLOAD_API: string = "NPDFileUpload";
  public static BR_MED_FILEDOWNLOAD_API = "MedFileDownload";
  public static BR_NPD_FILEDOWNLOAD_API = "NPDFileDownload";

  public static BR_NPD_SEND_ALETER_MAIL_API = "Email/SendAlertMail";
  public static BR_SESSION_TIMEOUT_MASTER = "SessionTimeoutM/GetAll"

  public static BR_GET_SAP_CREATOR_COUNT = "VendorMaster/GetCreatorSummary"
  public static BR_GET_SAP_CREATOR_COUNT_Mail = "GetCreatorSummary"


  //LA
  //public static HR_EMPLOYEEMASTER_GET_LIST = "EmployeeMaster/GetEmployeesList";
  public static CONTRACT_EMPLOYEE_INSERT = "ContractEmployeeM";
  public static CONTRACT_EMPLOYEE_GETALL = "ContractEmployeeM/GetAll";
  public static CONTRACT_EMPLOYEE_GET_BY_ANY = "ContractEmployeeM/GetByParam";
  public static BR_API_GET_CONTRACTORS = "ContractEmployeeM/GetContractors";
  public static CONTRACT_EMPLOYEE_GET_FILTERED_LIST = "ContractEmployeeM/GetFilteredList";

  public static CONTRACT_EMPLOYEE_INSERT_NEW = "ContractEmployeeM/Create";

  public static BR_CHECK_CONTRACT_MANPOWER_PLANNING = "ContractEmployeeM/CheckManpowerPlanning";

  public static VALIDATE_MAN_POWER = "ContractManpowerPlanning/ValiadateManpower";

  public static GET_LEAVE_DATA_BY_EMPLOYEE = "LvTypeD/GetByParam";
  public static GET_LEAVE_DATA_GETALL = "LvTypeD/GetAll";
  public static GET_LEAVE_TYPES_DATA_GETALL = "LvTypeM/GetLeaveTypes";
  public static GET_LEAVE_TYPES_GETALL = "LvTypeM/GetAll";
  public static GET_LEAVE_REASONS_DATA_GETALL = "LeaveReason/GetAll";
  public static GET_LEAVE_APPROVER_DETAILS = "LvTypeM/GetApprovers";

  public static GET_AVAIL_COMPOFF_FOR_EMPLOYEE = "LvTypeD/GetCompOff";

  public static GET_APPROVERS_FOR_EMPLOYEE = "LvTypeD/GetLvApprovers";
  public static GET_PERMISSION_APPROVERS_FOR_EMPLOYEE = "LvTypeD/GetPerApprovers";
  public static GET_CANCEL_APPROVERS_FOR_EMPLOYEE = "LvTypeD/getCancelLeaveApprovers";
  public static GET_APPROVERS = "LvTypeD/GetApprovers";
  public static GET_PLANT_HEADS_FOR_EMPLOYEE = "LvTypeD/GetPlantHeadApprovers";

  public static GET_ALL_RULES_DATA_GETALL = "LvApplyRules/GetAll";

  public static GET_HOLIDAYS_LIST = "Holidays/GetByParam";
  public static GET_HOLIDAYS_LIST_BASED_ON_EMPLOYEES = "Holidays/GetHolidaysonEmployees";
  public static BR_HOLIDAY_LIST_CREATE = "Holidays/AddHolidays";
  public static BR_HOLIDAY_LIST_UPDATE = "Holidays";
  public static BR_HOLIDAY_LIST_DELETE = "Holidays";
  public static GET_HOLIDAY_TYPE = "Holidays/GetHolidayType";
  public static GET_HOLIDAY_REPORT_LIST = "Holidays/GetHolidayReport";

  public static GET_ALL_TYPE_CODES_LIST = "Holidays/GetTypeCodes";

  public static GET_EMPLOYEE_CALENDAR = "EmpCal/GetByParam";
  public static BR_EMP_CALENDAR_INSERT_UPDATE = "EmpCal";

  public static GET_WORKING_CALENDAR = "WorkingCalendar/GetByParam";
  public static BR_WORKING_CALENDAR_INSERT = "WorkingCalendar";
  public static BR_GET_PLANT_WORKING_CALENDAR = "WorkingCalendar/GetCalendar";
  public static BR_UPDATE_PLANT_WORKING_CALENDAR = "WorkingCalendar/UpdateCalendar";
  public static BR_GET_ADDITIONAL_HOLIDAYTYPES = "WorkingCalendar/GetAdditionalHolidays"
  public static BR_GET_ADDITIONAL_CALENDAR_TYPE = "WorkingCalendar/GetAdditionalCalendarType";

  public static GET_DAY_STATUS_FROM_WORKING_CALENDAR = "WorkingCalendar/GetDayStatus"

  public static BR_GET_EMP_WORKING_CALENDAR = "EmpCal/GetCalendar";
  public static BR_UPDATE_EMP_WORKING_CALENDAR = "EmpCal/UpdateCalendar";
  public static BR_CREATE_EMP_WORKING_CALENDAR = "WorkingCalendar/CreateCalendar"
  public static BR_GET_MAN_POWER_PLANNING = "ContractManpowerPlanning/GetByParam";
  public static BR_GET_WORKING_CALENDAR = "WorkingCalendar/GetCalendarData";
  public static BR_GET_EMP_ATTACHMENTS = "ConEmpFileDownload";
  public static BR_SAVE_EMP_ATTACHMENTS = "ConEmpFileUpload";
  public static BR_DELETE_ATTACHMENT_DETAILS = "ContractEmpAttachments/DeleteAttachment";
  public static BR_SAVE_CONTRACTOR_ATTACHMENTS = "ContractEmpAttachments";
  public static BR_GET_CONTRACT_EMPLOYEE_APPROVER = "ContractEmployeeApprovers/GetByParam";

  public static BR_GET_TOUR_PLAN_REQUESTS = 'TourPlan/InsertTourPlanRequest';

  public static BR_GET_ALL_SHIFTS = "EmpShiftMaster/GetAll";
  public static GET_EMP_SHIFT_DATA = "EmpShiftRegister/GetEmpShiftData";
  public static GET_EMP_SHIFT_DATA_FOR_REGISTER = "EmpShiftRegister/GetEmpShiftDataForRegister";
  public static GET_ATTENDANCE_PROCESS_HISTORY = "AttendanceProcessLog/GetByParam";
  public static INSERT_PROCESSING_LOG = "AttendanceProcessLog";
  public static BR_SHIFT_INSERT_UPDATE = "EmpShiftMaster";
  public static BR_CHECK_SHIFT_ALLOTTED = "EmpShiftMaster/CheckShiftAllotted";
  public static BR_GET_ALL_RULES = "LaRulesM/GetAll";
  public static BR_RULES_INSERT_UPDATE = "LaRulesM/InsertLARules";
  public static BR_RULES_UPDATE = "LaRulesM";
  public static BR_UPLOAD_EXCEL_FILE = "ExcelUpload";
  public static BR_GET_EMPLOYEE_LIST_FOR_SHIFT = "EmpShiftRegister/GetEmployeesForShift";
  public static BR_UPDATE_EMPLOYEE_SHIFT = "EmpShiftRegister/UpdateShift";
  public static BR_GET_EMPLOYEE = "EmpShiftRegister/GetData";
  public static BR_GET_EMPLOYEE_LEAVE_REQUESTS = "LeaveDetails/GetEmpRequests";
  public static BR_GET_EMPLOYEE_ESIC_LEAVE_REQUESTS = "LeaveDetails/GetEmpEsicRequests";
  public static BR_GET_LEAVE_REQUESTS = "LeaveDetails/GetEmpLERequests";
  public static BR_GET_LEAVE_REASONS = "LeaveReason/GetByParam";
  public static BR_CANCEL_EMP_LEAVE = "LeaveDetails/CancelLeave";
  public static CHECK_CANCEL_LEAVE_ONDUTY_FLAG = "LeaveDetails/CheckCancelLeaveOnDutyFlag";
  public static BR_APPLY_EMP_LEAVE = "LeaveDetails/ApplyLeave";
  public static BR_LEAVE_OD_FILEUPLOAD_API = "FileUploadLOD"
  public static BR_GET_ALL_REASONS_LIST = "LeaveReason/GetAll"
  public static BR_GET_ALL_ONDUTY_REASONS_LIST = "LeaveReason/GetAll"
  public static BR_GET_EMPLOYEE_ONDUTY_REQUESTS = "OnDutyDetails/GetEmpRequests";
  public static BR_GET_ONDUTY_REQUESTS = "OnDutyDetails/GetEmpODRequests";
  public static BR_CANCEL_EMP_ONDUTY = "OnDutyDetails/CancelLeave";
  public static BR_APPLY_EMP_ONDUTY = "OnDutyDetails/ApplyLeave";
  public static BR_ONDUTY_CANCEL_REQUEST = "OnDutyDetails";
  public static BR_ONDUTY_CANCEL_APP_REQUEST = "OnDutyDetails/CancelOnDuty";
  public static BR_GET_PENDING_REQUEST = "OnDutyDetails/GetPendingRequests";
  public static BR_APPROVE_PENDING_REQUEST = "OnDutyDetails/ApproveRequest";
  public static BR_GET_ATTENDANCE_FOR_PER = "PermissionDetails/GetAttendanceDetails";
  public static BR_INSERT_PERMISSION_REQUEST = "PermissionDetails/InsertPermission";
  public static UPDATE_PERMISSION_REQUEST = "PermissionDetails";
  public static BR_GET_EMPLOYEE_PERMISSION_REQUESTS = "PermissionDetails/GetEmpRequests";
  public static BR_GET_EMPLOYEE_ATTENDANCE = "LeaveDetails/GetAttendance";
  public static BR_GET_PERMISSION_REQUESTS = "PermissionDetails/GetEmpPMRequests";
  public static GET_EMP_DETAILS_FOR_OT = "LeaveDetails/GetEmpDetails";
  public static PROCESS_EMP_PLANT_ATTENDANCE = "LeaveDetails/ProcessAttendance";
  public static GET_MANUAL_ENTRY_LIST = "PermissionDetails/GetManualEntryList";
  public static BR_UPLOAD_MANUAL_ENTRY_FILE = "UploadManualEntry";
  public static BR_INSERT_COMP_OFF_REQUEST = "LeaveDetails/InsertCompOffRequest";
  public static BR_INSERT_OVER_TIME_REQUEST = "LeaveDetails/InsertOTRequest";
  public static BR_GET_OVER_TIME_REQUEST = "LeaveDetails/GetEmpOTRequests";
  public static BR_GET_EMP_OVER_TIME_REQUEST = "LeaveDetails/GetOverTime";
  public static BR_GET_COMP_OFF_REQUEST = "LeaveDetails/GetEmpCompOffRequests";
  public static BR_GET_UPDATE_COMPOFF_REQUESTS = "LeaveDetails/UpdateCompOffDetails";
  public static CHECK_COMPOFF_OT_ELIGIBILITY = "LeaveDetails/CheckCompOffOTEligibility";
  public static GET_WORK_DATE_SHIFT = "LeaveDetails/GetWorkDateShift";
  public static BR_GET_EMPLOYEE_CHANGESHIFT_REQUESTS = "ChangeShiftLog/GetEmpChangeShiftRequests";
  public static BR_GET_CHANGE_SHIFT_REQUESTS = "ChangeShiftLog/ChangeEmpIndividualShifts";
  public static BR_GET_EMPLOYEE_PAYSLIP_REQUESTS = "PayslipRequest/GetEmpPayslipRequests";
  public static BR_APPLY_PAYSLIP_REQUEST = "PayslipRequest";
  public static BR_GET_QUERY_CATEGORY: string = "HrQueryCategory/GetAll";
  public static BR_APPLY_QUERY_REQUEST = "HrQueries";
  public static BR_GET_EMPLOYEE_QUERY_REQUESTS = "HrQueries/GetEmpHrQueries";
  public static BR_GET_HR_QUERY_APPROVER = "HrQueries/GetHrQueryApprovers";
  public static GET_EMP_TP_DATA = "TourPlan/EmpTourPlanRequests";
  public static BR_GET_EMPLOYEE_LIST = "EmployeeMaster/GetEmpList";
  public static BR_GET_EMPLOYEE_LIST_FOR_REPORT = "EmployeeMaster/GetEmployeeDataForReport";
  public static BR_UPDATE_EMP_DATA = "EmployeeMaster/UpdateEmpData";
  public static BR_GET_EMP_HOLCAL = "EmployeeMaster/GetEmpHolCalList";
  public static BR_GET_EMP_HOLI_TYPES = "EmployeeMaster/GetEmpHolListForEmployees";
  public static BR_GET_EMP_CAL_TYPES = "EmployeeMaster/GetEmpCalListForEmployees";
  public static UPDATE_TOUR_PLAN = "TourPlan";

  public static BR_GET_MONTHLY_MUSTER_REPORT = "OnDutyDetails/GetMonthlyReport";
  public static BR_GET_MONTHLY_DETAILED_REPORT = "OnDutyDetails/GetMonthlyDetailedReport";
  public static GET_ALL_PUNCHES_LIST = "PermissionDetails/DisplayAllPunches";
  public static GET_MONTHLY_DAYWISE_REPORT = "LeaveDetails/MonthlyDayWiseReport";
  public static GET_ATTENDANCE_SUMMARY_REPORT = "LeaveDetails/AttendanceSummary";

  public static GET_YEARLY_LEAVE_REPORT = "LvTypeD/GetYearlyLeaveReport";
  public static GET_DAILY_ATTENDANCE_REPORT = "OnDutyDetails/GetDailyAttendanceReport";
  public static UPDATE_COMPOFF_REQUEST = "CompOt";

  public static GET_AUTHORIZED_EMPLOYEE_LIST = "EmployeeMaster/GetAuthorizedEmployeesList"
  public static GET_SHIFT_DASBOARD_DATE = "EmpShiftRegister/GetDashBoardData";
  public static BR_GET_EMP_PUNCH_DETAILS = "EmpShiftRegister/GetEmployeeDetails"

  public static GET_COMP_OFF_REPORT = "CompOt/Getcompoffreport";
  public static UPDATE_ROTATIONAL_SHIFT_DATA = "EmpShiftRegister/UpdateRotationalShift";
  public static DELETE_ROTATIONAL_SHIFT_DATA = "EmpShiftRegister/DeleteRotationalShift";

  public static SEND_REPORT_MAIL_FILE = "SendReportMail"; 

  //RFC Calls
  public static RFCBAPI_GET_PAYSLIP_API = "GetPaySlip";
  public static RFCBAPI_GET_FORM16_API = "GetForm16";

  //EssApprovers
  public static BR_ESSAPPROVERS_ALL_API = "EssApprovers/GetAll";
  public static BR_ESSAPPROVERS_GETBY_ID = "EssApprovers/id";
  public static BR_ESSAPPROVERS_INSERT = "EssApprovers";
  public static BR_ESSAPPROVERS_GETBYPARAM = "EssApprovers/GetByParam";
  public static BR_ESSAPPROVERS_DELETE = "EssApprovers";
  public static BR_ESSAPPROVERS_UPDATE = "EssApprovers";

  //ESS
  public static BR_UPLOAD_EXCELFILE_Co = "PutCoUpdateDetails";
  public static BR_UPLOAD_EXCELFILE_Ot = "PutOTUpdateDetails";

  //LeaveStructure
  public static BR_LEAVESTRUCTURE_GETALL = "LeaveStructure/GetLeaveStructures";
  public static BR_LEAVESTRUCTURE_INSERT_API = "LeaveStructure/AddLeaveStructure";
  public static BR_LEAVESTRUCTURE_UPDATE = "LeaveStructure"
  public static BR_LEAVESTRUCTURE_DELETE = "LeaveStructure"

  //LeaveType
  public static BR_LEAVETYPE_GETALL = "LvTypeM/GetAll";
  public static BR_LEAVETYPE_INSERT_API = "LvTypeM";
  public static BR_LEAVETYPE_UPDATE = "LvTypeM";
  public static BR_LEAVETYPE_DELETE = "LvTypeM";

  public static BR_SEND_MAIL_FOR_LEAVE = "LeaveDetails/SendLeavePendingMail";

  public static BR_SEND_MAIL_FOR_ONDUTY = "OnDutyDetails/SendOnDutyPendingMail";
  public static BR_SEND_MAIL_FOR_PERMISSION = "PermissionDetails/SendPerPendingMail";

  public static BR_GET_DAILY_SHIFT_REPORT = "LeaveDetails/GetDailyShiftReport";
  public static BR_GET_DAILY_ESSL_REPORT = "LeaveDetails/GetEsslPunchReport";
  public static GET_MONTHLY_CONTRACTUAL_REPORT = "LeaveDetails/GetContractualReport";
  public static GET_MONTHLY_ADDR_ATTR_REPORT = "LeaveDetails/GetAddAttrReport";
  public static GET_MANUAL_ENTRY_AUDIT_REPORT = "LeaveDetails/GetManualEntryAuditReport";
  public static GET_MONTHLY_OT_REPORT = "LeaveDetails/GetMonthlyOTReport";
  public static INSERT_MANUAL_ENTRY_SWIPE = "EmpManualSwipe";
  public static CALCULATE_NO_OF_LEAVE_DAYS = "LeaveDetails/CalculateDays";
  public static GET_ATTENDANCE_FOR_PAYROLL = "LeaveDetails/PayrollAttendance";
  public static GET_ALL_DEV_REPORT = "Devices/GetAll";
  public static GET_DEV_BIO_REPORT = "Devices/GetDevBio";
  public static GET_EMP_SHIFT_ALLOWANCE_REPORT = "EmpShiftRegister/GetEmpShiftAllowance";

  //LeaveReason
  public static BR_LEAVEREASON_GETALL = "LeaveReason/GetAll";
  public static BR_LEAVEREASON_INSERT_API = "LeaveReason";
  public static BR_LEAVEREASON_UPDATE = "LeaveReason";
  public static BR_LEAVEREASON_DELETE = "LeaveReason"

  //CompOtRules
  public static BR_COMPOTRULES_GETALL = "CompOtRules/GetAll";
  public static BR_COMPOTRULES_INSERT_API = "CompOtRules";
  public static BR_MASTER_GRADE_MASTER = "Grade/GetAll";
  public static BR_COMPOTRULES_UPDATE = "CompOtRules";
  public static BR_COMPOTRULES_DELETE = "CompOtRules"

  //WorkType
  public static BR_MASTER_WORKTYPE_API = "WorkType/GetAll";

  //EssTemplates
  public static BR_ESSTEMPLATES_GETALL = "EssTemplates/GetAll";
  public static BR_ESSTEMPLATES_INSERT_API = "EssTemplates";
  public static BR_ESSTEMPLATES_UPDATE = "EssTemplates";
  public static BR_ESSTEMPLATES_DELETE = "EssTemplates"
  public static BR_GET_ESS_ATTACHMENTS = "EssTemplateDownload";

  //Absent Intimation
  public static ABSENT_INTIMATION_INSERT_UPDATE = "AbsentIntimation";
  public static ABSENT_INTIMATION_GET_ALL = "AbsentIntimation/GetAll";
  public static ABSENT_INTIMATION_REPORT = "AbsentIntimation/IntimationReport";

  //Plant Head 
  public static GET_PLANT_HEAD_DATA_GETALL = "PlantHead/GetAll";
  public static BR_PLANTHEAD_INSERT_API = "PlantHead";
  public static BR_PLANTHEAD_UPDATE_API = "PlantHead";

  //Regularization
  // public static BR_REGULARIZATIONRULES_GETALL="RegularizationRequest/GetAll";
  // public static BR_REGULARIZATIONREQUEST_INSERT_API="RegularizationRequest";
  // public static BR_REGULARIZATIONREQUEST_UPDATE="RegularizationRequest";
  // public static BR_REGULARIZATIONREQUEST_DELETE="RegularizationRequest"

  public static GET_EMP_OF_REPORTING = "LeaveDetails/GetEmpOfReporting";

  public static GET_CONTRACT_MAN_POWER_REPORT = "ContractManpowerPlanning/GetManPowerReport";
  public static BR_MANPOWERPLANNING_INSERT_API = "ContractManpowerPlanning/AddManpowerPlanning";
  public static INSERT_REGULARIZATION_REQUEST = "PermissionDetails/InsertRegularization";
  public static GET_EMPLOYEE_REG_REQUESTS = "PermissionDetails/GetEmpRegRequests";
  public static GET_EMPLOYEE_PAYREG_REQUESTS = "PermissionDetails/GetEmpPayRegRequests";
  public static INSERT_PAYROLL_REGULARIZATION_REQUEST = "PermissionDetails/InsertPayrollRegularization";
  public static UPDATE_REGULARIZATION_REQUEST = "RegularizationRequest";
  public static UPDATE_PAYROLL_REGULARIZATION_REQUEST = "PayrollRegularization";

  public static GET_EMPLOYEES_FOR_ATTENDANCE = "EmployeeMaster/GetEmployeesList";
  public static GET_EMPLOYEES_DATA_BASEDON_ID = "EmployeeMaster/GetEmpDataBasedOnEmployeeID";

  public static BR_MASTER_LEAVE_FILEUPLOAD_API: string = "LeaveFileUpload";
  public static BR_LEAVE_FILEDOWNLOAD_API = "LeaveFileDownload";

  public static BR_MASTER_ONDUTY_FILEUPLOAD_API: string = "OnDutyFileUpload";
  public static BR_ONDUTY_FILEDOWNLOAD_API = "OnDutyFileDownload";

  public static INSERT_LOP_REIMBURSEMENT_REQUEST = "PermissionDetails/InsertReimbursementRequest";
  public static GET_REIMBURSEMENT_REQUESTS = "LopReimbursement/GetByParam";
  public static GET_REIMBURSEMENT_LIST = "LopReimbursement/GetReimbursementList";
  public static LOP_REIMBURSEMENT_REPORT = "LopReimbursement/GetReimbursementReport";

  public static GET_EMPLOYEES_ON_ROTATION = "EmpShiftRegister/GetRotationalShiftEmpList";
  public static UPDATE_DEPENDANT_DETAILS = "MedclaimDependantDetails";
  public static GET_DEPENDANT_DETAILS = "MedclaimDependantDetails/GetByParam";
  public static GET_CONTACT_DETAILS = "MedClaimContactDetails/GetAll";
  public static BR_UPLOAD_EXCELFILE = "InsertEmployeeData"
  // public static BR_MASTER_GRADE_MASTER="Grade/GetAll";

  // Allerts

  public static ALLERTS_GET_ALL = "LeaveDetails/GetByFilter";
  public static ALLERTS_SAVE_ANNOUNCEMENT_DETAILS = "LeaveDetails/SaveAnnouncementDetails";
  public static ALLERTS_GET_TOP_ANNOUNCEMENTS = "LeaveDetails/TopAnnouncements";
  public static ALLERTS_GET_ALL_ACTIVE_ANNOUNCEMENTS = "LeaveDetails/GetAllActiveAnnouncements";
  public static DELETE_ALLERT = "LeaveDetails/DeleteAllert"
  public static GET_ALERTS_BASED_ON_EMP = "LeaveDetails/GetAlertBasedOnEmp";
  public static GET_ALERTS_IMAGE = "LeaveDetails/GetAnnouncementAttachment"
  //**************************************************** */
  //                  HR Module APIs
  //**************************************************** */
  // OfferLetter
  public static OFFER_GET_PLANTS_ASSIGNED = "EmployeePPCMapping/GetPlantsAssigned";
  public static OFFER_GET_PAY_GROUPS_ASSIGNED = "EmployeePPCMapping/GetPayGroupsAssigned";
  public static OFFER_GET_EMP_CATEGORIES_ASSIGNED = "EmployeePPCMapping/GetEmpCategoriesAssigned";

  public static OFFER_PLANT_MASTER_API = "PlantMaster";
  public static OFFER_PLANT_MASTER_ALL_API = "PlantMaster/GetAll";

  public static OFFER_PAYGROUP_MASTER_API = "PayGroupMaster";
  public static OFFER_PAYGROUP_MASTER_ALL_API = "PayGroupMaster/GetAll";

  public static OFFER_EMPLOYEE_CATEGORY_MASTER_API = "EmployeeCategoryMaster";
  public static OFFER_EMPLOYEE_CATEGORY_ALL_API = "EmployeeCategoryMaster/GetAll";

  public static OFFER_LOCATION_MASTER_API = "LocationMaster";
  public static OFFER_LOCATION_MASTER_ALL_API = "LocationMaster/GetAll";

  public static OFFER_STATE_API = "State";
  public static OFFER_STATE_GET_BY_COUNTRY = "State/GetByCountry";
  public static OFFER_STATE_ALL_API = "StateMaster/GetAll";

  public static OFFER_ROLE_MASTER_API = "RoleMaster";
  public static OFFER_ROLE_MASTER_ALL_API = "RoleMaster/GetAll";

  public static OFFER_GRADE_API = "Grade";
  public static OFFER_GRADE_ALL_API = "Grade/GetAll";

  public static OFFER_PENDING_TASKS = "OfferLetter/GetPendingTasks";
  public static OFFER_APPROVE_TASK = "OfferLetter/ApproveTask";
  public static OFFER_REJECT_TASK = "OfferLetter/RejectTask";

  public static OFFER_DETAILS_API = "OfferLetter";
  public static OFFER_DETAILS = "OfferLetter/GetAll";
  public static OFFER_DETAILS_CREATE = "OfferLetter/Create";
  public static OFFER_DETAILS_UPDATE = "OfferLetter/Update";
  public static OFFER_DETAILS_CHECK_SALARY_IN_RANGE = "OfferLetter/CheckIfSalaryInRange";
  public static OFFER_DETAILS_UPDATE_SALARY_INFO = "OfferLetter/UpdateSalaryInfo";
  public static OFFER_DETAILS_ADD_ATTACHMENTS = "OfferLetter/AddAttachments";
  public static OFFER_DETAILS_GET_ATTACHMENT_FILE = "OfferLetter/GetAttachment";
  public static OFFER_DETAILS_GET_ATTACHMENT_LIST = "OfferLetter/GetAttachments";
  public static OFFER_GET_SIGNATORIES = "OfferLetter/GetSignatories";
  public static OFFER_GET_OFFERS_LIST_BY_FILTER = "OfferLetter/GetOfferLetterListByFilter";
  public static CHECKLIST_GET_CHECKLIST_BY_FILTER = "OfferLetter/GetChecklistItemsByFilter";
  public static EMPLOYEE_GET_EMPLOYEELIST = "Employee/GetEmployeesByFilter";
  public static OFFER_DETAILS_UPDATE_STATUS = "OfferLetter/UpdateOfferStatus";
  public static OFFER_DETAILS_SUBMIT_FOR_APPROVAL = "OfferLetter/SubmitForApproval";
  public static OFFER_DETAILS_SUBMIT_FOR_EXCEPTION_APPROVAL = "OfferLetter/SubmitForExceptionApproval";
  public static OFFER_DETAILS_SEND_EMAIL = "OfferLetter/SendOfferEmail";
  public static OFFER_DETAILS_SEND_CANDIDATE_ENTRY_EMAIL = "OfferLetter/SendCandidateEntryEmail";
  public static OFFER_GET_CHECKLIST_ITEMS = "OfferLetter/GetChecklistItems";
  public static OFFER_GET_SPOC_CHECKLIST_ITEMS = "OfferLetter/GetSpocChecklistItems";
  public static OFFER_SAVE_CHECKLIST_ITEMS = "OfferLetter/SaveChecklistItems";
  public static OFFER_GET_ADDITIONAL_INFO = "OfferLetter/GetAdditionalInfo";
  public static OFFER_UPDATE_ADDITIONAL_INFO = "OfferLetter/UpdateAdditionalInfo";
  public static OFFER_GET_REPLACING_EMPLOYEE_DETAILS = "OfferLetter/GetReplacingEmployeeDetails";
  public static OFFER_DELETE_ATTACHMENT = "OfferLetter/DeleteAttachment";

  public static OFFER_GET_OFFERS_LIST_REPORT_BY_FILTER = "OfferLetter/GetOfferListReportByFilter";
  public static OFFER_GET_OFFERS_SUMMARY_REPORT_BY_FILTER = "OfferLetter/GetOfferSummaryReportByFilter";
  public static OFFER_GET_OFFERS_DASHBOARD_RESULT_BY_FILTER = "OfferLetter/GetDashboardResultByFilter";

  public static CANDIDATE_ACCEPT_OFFER = "Candidate/AcceptOffer";
  public static CANDIDATE_ACCEPT_APPOINTMENT = "Candidate/AcceptAppointment";
  public static CANDIDATE_GET_APPOINTMENT_LETTER_FOR_PRINT = "Candidate/GetLetterForPrint";

  public static OFFER_GETOFFERSALARYHEADDETAILS = "OfferLetter/GetOfferSalaryHeadDetails";
  public static OFFER_GETOTHERBENEFITS = "OfferLetter/GetOtherBenefits";

  public static OFFER_GET_CTC_BREAKUP = "OfferLetter/GetCTCBreakup";
  public static OFFER_GET_CTC_BREAKUP_ON_GROSS = "OfferLetter/GetCTCBreakupOnGross";

  public static OFFER_GET_ACTIVITIES = "OfferLetter/GetOfferActivities";
  public static OFFER_GET_OFFER_WORKFLOWS = "OfferLetter/GetOfferWorkflows";
  public static OFFER_GET_PRINT_TEMPLATES = "OfferLetter/GetPrintTemplates";
  public static OFFER_GET_LETTER_FOR_PRINT = "OfferLetter/GetLetterForPrint";

  public static EDUCATION_C_M_API_GETALL = "EducationCM/GetAll";

  public static CANDIDATE_GET_OFFER_BY_ID = "Candidate/GetOfferById";
  public static CANDIDATE_GET_PERSONAL_DETAILS = "Candidate/GetPersonalDetails";
  public static CANDIDATE_SAVE_PERSONAL_DETAILS = "Candidate/SavePersonalDetails";
  public static CANDIDATE_GET_ADDRESS_DETAILS = "Candidate/GetAddressDetails";
  public static CANDIDATE_SAVE_ADDRESS_DETAILS = "Candidate/SaveAddressDetails";
  public static CANDIDATE_GET_FAMILY_DETAILS = "Candidate/GetFamilyDetails";
  public static CANDIDATE_SAVE_FAMILY_DETAILS = "Candidate/SaveFamilyDetails";
  public static CANDIDATE_GET_EDUCATION_DETAILS = "Candidate/GetEducationDetails";
  public static CANDIDATE_SAVE_EDUCATION_DETAILS = "Candidate/SaveEducationDetails";
  public static CANDIDATE_DELETE_EDUCATION_DETAILS = "Candidate/DeleteEducationDetails";
  public static CANDIDATE_GET_EDUCATION_FILE = "Candidate/GetEducationAttachment";
  public static CANDIDATE_GET_WORK_DETAILS = "Candidate/GetWorkExperienceDetails";
  public static CANDIDATE_SAVE_WORK_DETAILS = "Candidate/SaveWorkExperienceDetails";
  public static CANDIDATE_DELETE_WORK_DETAILS = "Candidate/DeleteWorkExperienceDetails";
  public static CANDIDATE_GET_WORK_FILE = "Candidate/GetWorkAttachment";
  public static CANDIDATE_GET_BANK_DETAILS = "Candidate/GetBankDetails";
  public static CANDIDATE_SAVE_BANK_DETAILS = "Candidate/SaveBankDetails";
  public static CANDIDATE_GET_LANGUAGE_DETAILS = "Candidate/GetLanguageDetails";
  public static CANDIDATE_SAVE_LANGUAGE_DETAILS = "Candidate/SaveLanguageDetails";
  public static CANDIDATE_GET_NOMINATION_DETAILS = "Candidate/GetNominationDetails";
  public static CANDIDATE_SAVE_NOMINATION_DETAILS = "Candidate/SaveNominationDetails";
  public static CANDIDATE_GET_ATTACHMENT_DETAILS = "Candidate/GetAttachmentDetails";
  public static CANDIDATE_SAVE_ATTACHMENT_DETAILS = "Candidate/SaveAttachmentDetails";
  public static CANDIDATE_DELETE_ATTACHMENT_DETAILS = "Candidate/DeleteAttachment";
  public static CANDIDATE_GET_ATTACHMENT_FILE = "Candidate/GetAttachment";
  public static CANDIDATE_SUBMIT_DETAILS = "Candidate/SubmitDetails";

  public static APPOINTMENT_GET_PERSONAL_DETAILS = "Appointment/GetPersonalDetails";
  public static APPOINTMENT_SAVE_PERSONAL_DETAILS = "Appointment/SavePersonalDetails";
  public static APPOINTMENT_GET_ADDRESS_DETAILS = "Appointment/GetAddressDetails";
  public static APPOINTMENT_SAVE_ADDRESS_DETAILS = "Appointment/SaveAddressDetails";
  public static APPOINTMENT_GET_FAMILY_DETAILS = "Appointment/GetFamilyDetails";
  public static APPOINTMENT_SAVE_FAMILY_DETAILS = "Appointment/SaveFamilyDetails";
  public static APPOINTMENT_GET_EDUCATION_DETAILS = "Appointment/GetEducationDetails";
  public static APPOINTMENT_SAVE_EDUCATION_DETAILS = "Appointment/SaveEducationDetails";
  public static APPOINTMENT_DELETE_EDUCATION_DETAILS = "Appointment/DeleteEducationDetails";
  public static APPOINTMENT_GET_EDUCATION_FILE = "Appointment/GetEducationAttachment";
  public static APPOINTMENT_GET_WORK_DETAILS = "Appointment/GetWorkExperienceDetails";
  public static APPOINTMENT_SAVE_WORK_DETAILS = "Appointment/SaveWorkExperienceDetails";
  public static APPOINTMENT_DELETE_WORK_DETAILS = "Appointment/DeleteWorkExperienceDetails";
  public static APPOINTMENT_GET_WORK_FILE = "Appointment/GetWorkAttachment";
  public static APPOINTMENT_GET_BANK_DETAILS = "Appointment/GetBankDetails";
  public static APPOINTMENT_SAVE_BANK_DETAILS = "Appointment/SaveBankDetails";
  public static APPOINTMENT_GET_LANGUAGE_DETAILS = "Appointment/GetLanguageDetails";
  public static APPOINTMENT_SAVE_LANGUAGE_DETAILS = "Appointment/SaveLanguageDetails";
  public static APPOINTMENT_GET_NOMINATION_DETAILS = "Appointment/GetNominationDetails";
  public static APPOINTMENT_SAVE_NOMINATION_DETAILS = "Appointment/SaveNominationDetails";
  public static APPOINTMENT_GET_ATTACHMENT_DETAILS = "Appointment/GetAttachmentDetails";
  public static APPOINTMENT_SAVE_ATTACHMENT_DETAILS = "Appointment/SaveAttachmentDetails";
  public static APPOINTMENT_DELETE_ATTACHMENT_DETAILS = "Appointment/DeleteAttachment";
  public static APPOINTMENT_GET_ATTACHMENT_FILE = "Appointment/GetAttachment";

  public static APPOINTMENT_GET_OFFICIAL_DETAILS = "Appointment/GetOfficialDetails";
  public static APPOINTMENT_SAVE_OFFICIAL_DETAILS = "Appointment/SaveOfficialDetails";
  public static APPOINTMENT_GET_STATUTORY_DETAILS = "Appointment/GetStatutoryDetails";
  public static APPOINTMENT_SAVE_STATUTORY_DETAILS = "Appointment/SaveStatutoryDetails";
  public static APPOINTMENT_GET_SALARY_DETAILS = "Appointment/GetSalaryDetails";
  public static APPOINTMENT_SAVE_SALARY_DETAILS = "Appointment/SaveSalaryDetails";
  public static APPOINTMENT_GET_CTC_BREAKUP = "Appointment/GetCTCBreakup";
  public static APPOINTMENT_GET_CTC_BREAKUP_ON_GROSS = "Appointment/GetCTCBreakupOnGross";
  public static APPOINTMENT_GET_ASSET_DETAILS = "Appointment/GetAssetDetails";
  public static APPOINTMENT_SAVE_ASSET_DETAILS = "Appointment/SaveAssetDetails";
  public static APPOINTMENT_DELETE_ASSET_DETAILS = "Appointment/DeleteAssetDetails";
  public static APPOINTMENT_GET_ASSET_FILE = "Appointment/GetAssetAttachment";

  public static APPOINTMENT_GET_LIST_BY_FILTER = "Appointment/GetAppointmentListByFilter";
  public static APPOINTMENT_SUBMIT_DETAILS = "Appointment/SubmitDetails";
  public static APPOINTMENT_SUBMIT_FOR_VERIFICATION = "Appointment/SubmitForVerification";
  public static APPOINTMENT_SUBMIT_FOR_APPROVAL = "Appointment/SubmitForApproval";
  public static APPOINTMENT_GET_DETAILS_BY_ID = "Appointment/GetAppointmentDetails";
  public static APPOINTMENT_CONFIRM_JOINING = "Appointment/ConfirmJoining";
  public static APPOINTMENT_UPDATE_VERIFIED = "Appointment/UpdateVerified";
  public static APPOINTMENT_GET_LETTER_FOR_PRINT = "Appointment/GetLetterForPrint";
  public static APPOINTMENT_GET_OTHER_BENEFITS = "Appointment/GetOtherBenefits";
  public static APPOINTMENT_SEND_LETTER = "Appointment/SendAppointmentEmail";
  public static APPOINTMENT_RESEND_DETAILS_ENTRY_EMAIL = "Appointment/ResendCandidateEntryEmail";
  public static APPOINTMENT_SEND_DATA_TO_SAP = "Appointment/SendDataToSAP";
  public static APPOINTMENT_GET_OFFER_BY_APPOINTMENT_ID = "Appointment/GetOfferDetailsByAppointmentId";
  public static APPOINTMENT_GET_ACTIVITY_REPORTS_BY_FILTER = "Appointment/GetAppointmentActivityListByFilter";

  public static APPOINTMENT_GET_ADDRESS_TYPES = "Candidate/GetAddressTypes";
  public static APPOINTMENT_GET_LANGUAGES = "Candidate/GetLanguages";
  public static APPOINTMENT_GET_STATES = "Candidate/GetStates";
  public static APPOINTMENT_GET_COUNTRIES = "Candidate/GetCountries";
  public static APPOINTMENT_GET_EDUCATION_LEVELS = "Candidate/GetEducationLevels";
  public static APPOINTMENT_GET_COURSES = "Candidate/GetCourses";
  public static APPOINTMENT_GET_MARITAL_STATUS = "Candidate/GetMaritalStatus";
  public static APPOINTMENT_GET_RELIGIONS = "Candidate/GetReligions";
  public static APPOINTMENT_GET_NATIONALITY = "Candidate/GetNationality";
  public static APPOINTMENT_GET_INDUSTRIES = "Candidate/GetIndustries";
  public static APPOINTMENT_GET_RELATION_TYPES = "Candidate/GetRelationTypes";
  public static APPOINTMENT_GET_ACCOUNT_TYPES = "Candidate/GetAccountTypes";

  public static APPOINTMENT_GET_ALLOWANCE_TYPES = "Appointment/GetAllowances";
  public static APPOINTMENT_GET_SALARY_HEADS = "Appointment/GetSalaryHeads";
  public static APPOINTMENT_GET_PRINT_TEMPLATES = "Appointment/GetPrintTemplates";
  public static APPOINTMENT_GET_ADDRESS_LIST = "Appointment/GetAddressList";
  public static APPOINTMENT_GET_SIGNATORIES = "Appointment/GetSignatories";
  public static APPOINTMENT_GET_SUB_DEPARTMENTS = "SubDeptMaster/GetAll";
  public static APPOINTMENT_GET_REPORTING_GROUPS = "ReportingGroupM/GetAll";
  public static APPOINTMENT_GET_ASSET_TYPES = "AssetTypeMaster/GetAll";
  public static APPOINTMENT_GET_PROBATION_NOTICE_PERIODS = "PnPeriodMaster/GetAll";
  public static APPOINTMENT_GET_CURRENCIES = "Currency/GetAll";
  public static APPOINTMENT_GET_BANK_LIST = "BankTypeM/GetAll";

  public static HR_EMPLOYEEMASTER_GET_LIST = "EmployeeMaster/GetEmployeesList";
  public static HR_EMPLOYEEMASTER_GET_ALL_LIST = "EmployeeMaster/GetAllEmployeesList";

  public static OFFER_SAVEOFFERSALARYDETAILS = "OfferLetter/SaveOfferSalaryDetails";
  public static OFFER_GETOFFERSALARYDETAILS = "OfferLetter/GetOfferSalaryDetails";

  //Separation

  public static RESIGNATION_GET_PLANTS_ASSIGNED = "EmployeePPCMapping/GetPlantsAssigned";
  public static RESIGNATION_GET_PAY_GROUPS_ASSIGNED = "EmployeePPCMapping/GetPayGroupsAssigned";
  public static RESIGNATION_GET_EMP_CATEGORIES_ASSIGNED = "EmployeePPCMapping/GetEmpCategoriesAssigned";
  public static RESIGNATION_RESUBMIT_DETAILS = "Resignation/ResubmitResignationDetails";
  public static RESIGNATION_CREATE = "Resignation/Create";
  public static RESIGNATION_UPDATE = "Resignation/Update";
  public static RESIGNATION_SUBMIT_FOR_APPROVAL = "Resignation/SubmitForApproval";
  public static RESIGNATION_PLANT_MASTER_API = "PlantMaster";
  public static RESIGNATION_PLANT_MASTER_ALL_API = "PlantMaster/GetAll";
  public static RESIGNATION_LIST_BY_FILTER = "Resignation/GetResignationListByFilter";
  public static RESIGNATION_EMPLOYEEMASTER_GET_LIST = "Resignation/GetEmployeesList";
  public static RESIGNATION_EMPLOYEES_GET_BYID = "Resignation/GetEmployeeDetails";
  public static RESIGNATION_DETAILS_GET_BYID = "Resignation/GetResignationDetailsById";
  public static RESIGNATION_STATUS_GET_BYEMPID = "Resignation/GetResignationStatusByEmpId";
  public static RESIGNATION_DETAILS_API = "Resignation";
  public static RESIGNATION_ADD_ATTACHMENTS = "Resignation/AddAttachments";
  public static RESIGNATION_DELETE_ATTACHMENT = "Resignation/DeleteAttachment";
  public static RESIGNATION_DETAILS_GET_ATTACHMENT_FILE = "Resignation/GetAttachment";
  public static RESIGNATION_GET_ACTIVITIES = "Resignation/GetResignationActivities";
  public static RESIGNATION_UPDATE_STATUS = "Resignation/UpdateResignationStatus";
  public static RESIGNATION_INITIATE_EXIT = "Resignation/InitiateExit";
  public static RESIGNATION_COMPLETE_EXIT = "Resignation/CompleteExit";
  public static RESIGNATION_PENDING_TASKS = "Resignation/GetPendingTasks";
  public static RESIGNATION_APPROVE_TASK = "Resignation/ApproveTask";
  public static RESIGNATION_REJECT_TASK = "Resignation/RejectTask";
  public static RESIGNATION_GET_CHECKLIST_BY_FILTER = "Resignation/GetChecklistItemsByFilter";
  public static RESIGNATION_GET_CHECKLIST_ITEMS = "Resignation/GetChecklistItems";
  public static RESIGNATION_GET_SPOC_CHECKLIST_ITEMS = "Resignation/GetSpocChecklistItems";
  public static RESIGNATION_SAVE_CHECKLIST_ITEMS = "Resignation/SaveChecklistItems";
  public static RESIGNATION_GET_PRINT_TEMPLATES = "Resignation/GetPrintTemplates";
  public static RESIGNATION_GET_LETTER_FOR_PRINT = "Resignation/GetLetterForPrint";
  public static RESIGNATION_DETAILS_SEND_EMAIL = "Resignation/SendResignationEmail";
  public static RESIGNATION_GET_HISTORY_BY_EMP_ID = "Resignation/GetResignationHistory";
  public static RESIGNATION_DATE_GET_BYEMPID = "Resignation/GetResignationDateByEmpId";
  public static RESIGNATION_GET_EXIT_INTERVIEW_QUESTIONS = "Resignation/GetExitInterviewQuestions";
  public static RESIGNATION_SAVE_EXIT_INTERVIEW_QUESTIONS = "Resignation/SaveExitInterviewQuestions";

  public static RESIGNATION_GET_EXIT_INTERVIEW_ANSWERS = "Resignation/GetExitInterviewAnswers";
  public static RESIGNATION_SAVE_EXIT_INTERVIEW_ANSWERS = "Resignation/SaveExitInterviewAnswers";
  public static RESIGNATION_EXIT_INTERVIEW_LINK = "Resignation/SendExitInterviewEmail";
  public static RESIGNATION_GET_EXIT_INTERVIEW_ANSWERS_LINK = "Candidate/GetExitInterviewAnswers";
  public static RESIGNATION_SAVE_EXIT_INTERVIEW_ANSWERS_LINK = "Candidate/SaveExitInterviewAnswers";
  public static RESIGNATION_PAYMENT_LIST_BY_FILTER = "Resignation/GetResignationPaymentListByFilter";
  public static RESIGNATION_GET_DASHBOARD_RESULT_BY_FILTER = "Resignation/GetDashboardResultByFilter";
  public static RESIGNATION_GET_CHECKLIST = "Resignation/GetCheckList";

  //Employee
  public static HR_EMPLOYEE_DETAILS_API = "Employee";
  public static HR_EMPLOYEE_GET_DOCUMENTS_BY_FILTER = "Employee/GetEmployeeDocumentsByFilter";
  public static HR_EMPLOYEE_GET_DOCUMENTS = "Employee/GetDocuments";
  public static HR_EMPLOYEE_GET_DOCUMENT_FILE = "Employee/GetDocument";
  public static HR_EMPLOYEE_SAVE_DOCUMENT = "Employee/SaveDocument";
  public static HR_EMPLOYEE_SAVE_LETTER_ACTIVITY = "Employee/SaveLetterActivity";
  public static HR_EMPLOYEE_GET_SALARY_DETAILS = "Employee/GetSalaryDetails";
  public static HR_EMPLOYEE_GET_CTC_BREAKUP = "Employee/GetCTCBreakup";
  public static HR_EMPLOYEE_GET_CTC_BREAKUP_ON_GROSS = "Employee/GetCTCBreakupOnGross";
  public static HR_EMPLOYEE_GET_OTHER_BENEFITS = "Employee/GetOtherBenefits";
  public static HR_EMPLOYEE_GET_SALARY_HEADS = "Employee/GetSalaryHeads";
  public static HR_EMPLOYEE_GET_EXITED_LIST = "Employee/GetExitedEmployeesList";
  public static HR_EMPLOYEE_GET_BIRTHDAYS_ANNIVERSARY_LIST = "Employee/GetBirthdaysAndAnniversaryList";
  public static HR_EMPLOYEE_GET_NEW_JOINERS_LIST = "Employee/GetNewJoinersList";
  public static HR_EMPLOYEE_GET_PENDING_TASKS_SUMMARY = "Employee/GetPendingTasksSummary";
  public static HR_EMPLOYEE_ADD_ATTACHMENTS = "Employee/AddAttachments";
  public static HR_EMPLOYEE_GET_ATTACHMENTS = "Employee/GetAttachmentList";
  public static HR_EMPLOYEE_GET_ATTACHMENT_FILE = "Employee/GetAttachment";
  public static HR_EMPLOYEE_DELETE_ATTACHMENT = "Employee/DeleteAttachment";
  public static HR_EMPLOYEE_GET_LIST_REPORT_BY_FILTER = "Employee/GetEmployeeListReportByFilter";
  public static HR_EMPLOYEE_GET_LIST_FAMILY_REPORT_BY_FILTER = "Employee/GetEmployeeFamilyListReportByFilter";
  public static HR_EMPLOYEE_GET_LIST_EDUCATION_REPORT_BY_FILTER = "Employee/GetEmployeeEducationListReportByFilter";
  public static HR_EMPLOYEE_GET_LIST_EXPERIENCE_REPORT_BY_FILTER = "Employee/GetEmployeeWorkExperienceListReportByFilter";
  public static HR_EMPLOYEE_GET_LIST_STATUTORY_REPORT_BY_FILTER = "Employee/GetEmployeeStatutoryListReportByFilter";
  public static HR_EMPLOYEE_GET_CTC_SUMMARY_REPORT_BY_FILTER = "Employee/GetEmployeeCTCSummaryReportByFilter";
  public static HR_EMPLOYEE_GET_CTC_BREAKUP_REPORT_BY_FILTER = "Employee/GetEmployeeCTCBreakupReportByFilter";
  public static HR_EMPLOYEE_GET_DASHBOARD_RESULT_BY_FILTER = "Employee/GetDashboardResultByFilter";
  public static HR_EMPLOYEE_GET_ADDRESS = "Employee/GetAddressDetails";
  public static HR_EMPLOYEE_GET_EDUCATION = "Employee/GetEducationDetails";
  public static HR_EMPLOYEE_GET_EXPERIENCE = "Employee/GetExperienceDetails";
  public static HR_EMPLOYEE_GET_FAMILY = "Employee/GetFamilyDetails";
  public static HR_EMPLOYEE_GET_LANGUAGE = "Employee/GetLanguageDetails";
  public static HR_EMPLOYEE_GET_ASSETS = "Employee/GetAssetDetails";
  public static HR_EMPLOYEE_DEPENDENCY_GET_LIST_REPORT_BY_FILTER = "Employee/GetEmployeeDependencyListReportByFilter";

  // Appraisal
  public static HR_EMPLOYEE_SAVE_APPRAISAL_DETAILS = "AppraisalDetails/SaveEmployeeAppraisalDetails";
  public static HR_EMPLOYEE_SAVE_INITIAL_APPRAISAL_DETAILS = "AppraisalDetails/SaveEmployeeInitialAppraisalDetails";
  public static HR_EMPLOYEE_GET_INITIAL_APPRAISAL_PENDING_TASKS = "AppraisalDetails/GetEmployeeInitialAppraisalPendingTasks";
  public static HR_EMPLOYEE_UPDATE_INITIAL_APPRAISAL_DETAILS = "AppraisalDetails/UpdateEmployeeInitialAppraisalDetails";
  public static HR_EMPLOYEE_GET_EMPLOYEE_INITIAL_APPRAISAL_REVIEW_LIST = "AppraisalDetails/GetEmployeeInitialAppraisalReviewList";
  public static HR_EMPLOYEE_SAVE_APPRAISAL_SALARY_DETAILS = "AppraisalDetails/SaveAppraisalSalaryDetails";
  public static HR_APPRAISAL_DETAILS_SUBMIT_FOR_APPROVAL = "AppraisalDetails/SubmitForApproval";
  public static HR_EMPLOYEE_APPRAISAL_PENDING_TASKS = "AppraisalDetails/GetPendingTasks";
  public static HR_EMPLOYEE_APPRAISAL_APPROVE_TASK = "AppraisalDetails/ApproveTask";
  public static HR_EMPLOYEE_APPRAISAL_REJECT_TASK = "AppraisalDetails/RejectTask";
  public static HR_EMPLOYEE_INITIAL_APPRAISAL_UPDATE_STATUS = "AppraisalDetails/UpdateInitialAppraisalStatus";
  public static HR_EMPLOYEE_GET_APPRAISAL_DETAILS = "AppraisalDetails/GetEmployeeAppraisalDetails";
  public static HR_APPRAISAL_GET_SIGNATORIES = "AppraisalDetails/GetSignatories";
  public static HR_EMPLOYEE_GET_HOD_RECOMMENDATIONS_DETAILS = "AppraisalDetails/GetHodRecommendationsDetails";
  public static HR_EMPLOYEE_APPRAISAL_GET_LETTER_FOR_PRINT = "AppraisalDetails/GetLetterForPrint";
  public static HR_EMPLOYEE_APPRAISAL_SEND_LETTER_EMAIL = "AppraisalDetails/SendAppraisalEmail";
  public static HR_EMPLOYEE_GET_APPRAISAL_DETAILS_API = "AppraisalDetails/GetEmployeeAppraisalDetail";
  public static HR_EMPLOYEE_APPRAISAL_GET_EMPLOYEELIST = "AppraisalDetails/GetEmployeesByFilter";
  public static HR_EMPLOYEE_GET_PREVIOUS_INITIATOR_RECOMMENDATIONS_DETAILS = "AppraisalDetails/GetRecommendationDetailsFromPreviousInitiator";
  public static HR_EMPLOYEE_APPRAISAL_EXPORT_CTC_DATA = "AppraisalDetails/GetEmployeeCTCBreakupReportList";

  public static HR_EMPLOYEE_BULK_UPLOAD_APPRAISAL = "AppraisalDetails/BulkUploadAppraisals";
  public static HR_EMPLOYEE_APPRAISAL_GET_HISTORY_BY_EMP_ID = "AppraisalDetails/GetHistory";
  public static HR_EMPLOYEE_APPRAISAL_CHECK_PREDEFINED_INITIATORS_EXISTS = "AppraisalDetails/CheckIfPredefinedInitiatorsExistsForEmployee";
  public static HR_EMPLOYEE_APPRAISAL_GET_APPRAISAL_LIST_REPORT_BY_FILTER = "AppraisalDetails/GetAppraisalListReportByFilter";

  public static CHECKLIST_UPDATE_STATUS = "Checklist/UpdateChecklist";
  public static CHECKLIST_GET_CHECKLIST_ITEMS_BY_FILTER = "Checklist/GetChecklistItemsByFilter";
  public static HR_EMPLOYEE_GET_EMPLOYEE_INITIAL_APPRAISAL_REVIEW_RECOMMENDATION_LIST = "AppraisalDetails/GetEmployeeInitialAppraisalReviewRecommendationList";
  public static HR_EMPLOYEE_APPRAISAL_GET_APPRAISAL_RECOMMENDATION_LIST_REPORT_BY_FILTER = "AppraisalDetails/GetAppraisalRecommendationListReportByFilter";

  // confirmation
  public static CONFIRMATION_API = "Confirmation";
  public static CONFIRMATION_GET_EMPLOYEE_LIST = "Confirmation/GetEmployeesByFilter";
  public static CONFIRMATION_DETAILS_BY_ID = "Confirmation/GetEmployeeConfirmationDetailsById";

  public static CONFIRMATION_SAVE_EMPLOYEE_CONFIRMATION_DETAILS = "Confirmation/SaveEmployeeConfirmationDetails";
  public static CONFIRMATION_GET_CONFIRMATION_LIST = "Confirmation/GetConfirmationListByFilter";
  public static CONFIRMATION_UPDATE_HOD_DETAILS = "Confirmation/UpdateEmployeeConfirmationHodDetails";
  public static CONFIRMATION_GET_SIGNATORIES = "Confirmation/GetSignatories";
  public static CONFIRMATION_PENDING_TASKS = "Confirmation/GetPendingTasks";

  public static CONFIRMATION_SAVE_FINAL_DETAILS = "Confirmation/SaveFinalConfirmationlDetails";
  public static CONFIRMATION_SAVE_FINAL_SALARY_DETAILS = "Confirmation/SaveFinalConfirmationSalaryDetails";
  public static CONFIRMATION_FINAL_SUBMIT_FOR_APPROVAL = "Confirmation/SubmitForApproval";
  public static CONFIRMATION_GET_LETTER_FOR_PRINT = "Confirmation/GetLetterForPrint";
  public static CONFIRMATION_APPROVE_TASK = "Confirmation/ApproveTask";
  public static CONFIRMATION_REJECT_TASK = "Confirmation/RejectTask";
  public static CONFIRMATION_SEND_LETTER_EMAIL = "Confirmation/SendConfirmationEmail";
  public static CONFIRMATION_GET_HOD_RECOMMENDATIONS_DETAILS = "Confirmation/GetHodRecommendationsDetails";
  public static CONFIRMATION_GET_HISTORY_BY_EMP_ID = "Confirmation/GetHistory";
  public static CONFIRMATION_GET_PREVIOUS_INITIATOR_RECOMMENDATIONS_DETAILS = "Confirmation/GetRecommendationDetailsFromPreviousInitiator";
  public static CONFIRMATION_CHECK_PREDEFINED_INITIATORS_EXISTS = "Confirmation/CheckIfPredefinedInitiatorsExistsForEmployee";
  public static CONFIRMATION_GET_CONFIRMATION_LIST_REPORT_BY_FILTER = "Confirmation/GetConfirmationListReportByFilter";
  public static CONFIRMATION_GET_CONFIRMATION_SUMMARY_REPORT_BY_FILTER = "Confirmation/GetConfirmationSummaryReportByFilter";
  public static HR_EMPLOYEE_BULK_UPLOAD_CONFIRMATION = "Confirmation/BulkUploadConfirmations";

  public static CONFIRMATION_EXPORT_CTC_DATA = "Confirmation/GetEmployeeCTCBreakupReportList";
  public static CONFIRMATION_GET_RECOMMENDATION_LIST = "Confirmation/GetConfirmationRecommendationListByFilter";
  public static CONFIRMATION_GET_RECOMMENDATION_LIST_REPORT_BY_FILTER = "Confirmation/GetConfirmationRecommendationListReportByFilter";
  //Recall
  public static RECALL_EMPLOYEEMASTER_GET_LIST = "Recall/GetEmployeesList";
  public static RECALL_SAVE_DETAILS = "Recall/SaveRecallDetails";
  public static RECALL_SUBMIT_FOR_APPROVAL = "Recall/SubmitForApproval"
  public static RECALL_SAVE_RECALL_SALARY_CHANGE = "Recall/SaveRecallSalaryDetails";
  public static RECALL_LIST_BY_FILTER = "Recall/GetRecallListByFilter";
  public static RECALL_UPDATE_STATUS = "Recall/UpdateRecallStatus";
  public static RECALL_GET_STATUS_BY_ID = "Recall/GetRecallStatusByEmpId";
  public static RECALL_CREATE = "Recall/Create";
  public static RECALL_UPDATE = "Recall/Update";
  public static RECALL_GET_DETAILS_BY_ID = "Recall/GetRecallDetails";
  public static RECALL_PENDING_TASKS = "Recall/GetPendingTasks";
  public static RECALL_APPROVE_TASK = "Recall/ApproveTask";
  public static RECALL_REJECT_TASK = "Recall/RejectTask";
  public static RECALL_OFFER_REPLACEMENTID = "Recall/GetReplacementDetailsById";
  public static RECALL_DATE_GET_BYEMPID = "Recall/GetResignationDateByEmpId";
  public static RECALL_GET_HISTORY_BY_EMP_ID = "Recall/GetReCALLHistory";
  public static RECALL_GET_PRINT_TEMPLATES = "Recall/GetPrintTemplates";
  public static RECALL_GET_LETTER_FOR_PRINT = "Recall/GetLetterForPrint";
  public static RECALL_DETAILS_SEND_EMAIL = "Recall/SendRecallEmail";
  public static RECALL_GET_SALARY_DETAILS_BY_ID = "Recall/GetRecallSalaryDetailsById";
  public static RECALL_ADD_ATTACHMENTS = "Recall/AddAttachments";
  public static RECALL_DETAILS_GET_ATTACHMENT_FILE = "Recall/GetAttachment";
  public static RECALL_LIST_REPORT = "Recall/GetRecallListReport";

  //Termination
  public static TERMINATION_EMPLOYEEMASTER_GET_LIST = "Termination/GetEmployeesList";
  public static TERMINATION_STATUS_GET_BYEMPID = "Termination/GetTerminationStatusByEmpId";
  public static TERMINATION_CREATE = "Termination/Create";
  public static TERMINATION_UPDATE = "Termination/Update";
  public static TERMINATION_SUBMIT_FOR_APPROVAL = "Termination/SubmitForApproval";
  public static TERMINATION_ADD_ATTACHMENTS = "Termination/AddAttachments";
  public static TERMINATION_GET_PLANTS_ASSIGNED = "EmployeePPCMapping/GetPlantsAssigned";
  public static TERMINATION_GET_PAY_GROUPS_ASSIGNED = "EmployeePPCMapping/GetPayGroupsAssigned";
  public static TERMINATION_GET_EMP_CATEGORIES_ASSIGNED = "EmployeePPCMapping/GetEmpCategoriesAssigned";
  public static TERMINATION_LIST_BY_FILTER = "Termination/GetTerminationListByFilter";
  public static TERMINATION_UPDATE_STATUS = "Termination/UpdateTerminationStatus";
  public static TERMINATION_DETAILS_GET_BYID = "Termination/GetTerminationDetailsById";
  public static TERMINATION_PENDING_TASKS = "Termination/GetPendingTasks";
  public static TERMINATION_APPROVE_TASK = "Termination/ApproveTask";
  public static TERMINATION_REJECT_TASK = "Termination/RejectTask";
  public static TERMINATION_GET_CHECKLIST_BY_FILTER = "Termination/GetChecklistItemsByFilter";
  public static TERMINATION_GET_CHECKLIST_ITEMS = "Termination/GetChecklistItems";
  public static TERMINATION_GET_SPOC_CHECKLIST_ITEMS = "Termination/GetSpocChecklistItems";
  public static TERMINATION_SAVE_CHECKLIST_ITEMS = "Termination/SaveChecklistItems";
  public static TERMINATION_GET_PRINT_TEMPLATES = "Termination/GetPrintTemplates";
  public static TERMINATION_GET_LETTER_FOR_PRINT = "Termination/GetLetterForPrint";
  public static TERMINATION_INITIATE_EXIT = "Termination/InitiateExit";
  public static TERMINATION_DETAILS_GET_ATTACHMENT_FILE = "Termination/GetAttachment";
  public static TERMINATION_DETAILS_SEND_EMAIL = "Termination/SendTerminationEmail";
  public static TERMINATION_GET_EXIT_INTERVIEW_ANSWERS = "Termination/GetExitInterviewAnswers";
  public static TERMINATION_SAVE_EXIT_INTERVIEW_ANSWERS = "Termination/SaveExitInterviewAnswers";
  public static TERMINATION_COMPLETE_EXIT = "Termination/CompleteExit";

  //Retirement
  public static RETIREMENT_EMPLOYEE_LIST_BY_FILTER = "Retirement/GetEmployeeListByFilter";
  public static RETIREMENT_LIST_BY_FILTER = "Retirement/GetRetirementListByFilter";
  public static RETIREMENT_STATUS_GET_BYEMPID = "Retirement/GetRetirementStatusByEmpId";
  public static RETIREMENT_CREATE = "Retirement/SaveRetirementDetails";
  public static RETIREMENT_UPDATE = "Retirement/Update";
  public static RETIREMENT_SUBMIT_FOR_APPROVAL = "Retirement/SubmitForApproval";
  public static RETIREMENT_GET_DETAILS_BY_ID = "Retirement/GetRetirementDetails";
  public static RETIREMENT_PENDING_TASKS = "Retirement/GetPendingTasks";
  public static RETIREMENT_APPROVE_TASK = "Retirement/ApproveTask";
  public static RETIREMENT_REJECT_TASK = "Retirement/RejectTask";
  public static RETIREMENT_GET_HISTORY_BY_EMP_ID = "Retirement/GetRetirementHistory";
  public static RETIREMENT_GET_PRINT_TEMPLATES = "Retirement/GetPrintTemplates";
  public static RETIREMENT_GET_LETTER_FOR_PRINT = "Retirement/GetLetterForPrint";
  public static RETIREMENT_GET_RETIREMENT_LETTER = "Retirement/GetRetirementLetterForPrint";
  public static RETIREMENT_DETAILS_SEND_EMAIL = "Retirement/SendRetirementEmail";
  public static RETIREMENT_EMPLOYEE_GET_DATE = "Retirement/GetEmployeeRetirementDate";
  public static RETIREMENT_LIST_REPORT = "Retirement/GetRetirementListReport";
  public static RETIREMENT_DETAILS_BY_EMPLOYEE_ID = "Retirement/GetRetirementDetailsByEmployeeId";

  //Manpower
  public static HR_MANPOWER_GET_JD_TEMPLATE_LIST = "Manpower/GetJDTemplateList";

  //Approvers Config 
  public static HR_GET_APPROVER_DETAILS = "ApproverConfig";
  public static HR_GET_APPROVER_CONFIG_LIST = "ApproverConfig/GetApproverConfigList";
  public static HR_ADD_APPROVER_CONFIG = "ApproverConfig/AddApproverConfig";
  public static HR_EDIT_APPROVER_CONFIG = "ApproverConfig/EditApproverConfig";

  //Email Notification
  public static EMAIL_NOTIFICATION_GET_STATE = "EmailNotification/GetState";
  public static EMAIL_NOTIFICATION_GET_EMAIL_NOTIFICATION = "EmailNotification/GetEmailNotificationListByFilter";
  public static EMAIL_NOTIFICATION_GET_EMAIL_BY_ID = "EmailNotification/GetEmailNotificationListById";
  public static EMAIL_NOTIFICATION_CREATE = "EmailNotification/Create";
  public static EMAIL_NOTIFICATION_UPDATE = "EmailNotification/Update";
  public static EMAIL_NOTIFICATION_DELETE = "EmailNotification/Delete";

  public static NO_EMAIL_CONFIG_GET_LIST = "NoEmailToCandidateConfig/GetEmailConfigListByFilter";
  public static NO_EMAIL_CONFIG_CREATE = "NoEmailToCandidateConfig/Create";
  public static NO_EMAIL_CONFIG_UPDATE = "NoEmailToCandidateConfig/Update";
  public static NO_EMAIL_CONFIG_DELETE = "NoEmailToCandidateConfig/Delete";

  //FNF    
  public static FNF_EMPLOYEE_LIST_BY_FILTER = "FNF/GetEmployeeListByFilter";
  public static FNF_LIST_BY_FILTER = "FNF/GetFNFListByFilter";
  public static FNF_LIST_BY_PIVOT = "FNF/GetFNFDetailsByPivot";
  public static FNF_STATUS_GET_BYEMPID = "FNF/GetFNFStatusByEmpId";
  public static FNF_CREATE = "FNF/SaveFNFDetails";
  public static FNF_UPDATE = "FNF/Update";
  public static FNF_SUBMIT_FOR_APPROVAL = "FNF/SubmitForApproval";
  public static FNF_GET_DETAILS_BY_ID = "FNF/GetFNFDetails";
  public static FNF_PENDING_TASKS = "FNF/GetPendingTasks";
  public static FNF_APPROVE_TASK = "FNF/ApproveTask";
  public static FNF_REJECT_TASK = "FNF/RejectTask";
  public static FNF_DETAILS_SEND_EMAIL = "FNF/SendFNFEmail";
  public static FNF_ADD_ATTACHMENTS = "FNF/AddAttachments";

  //Transfer
  public static HR_TRANSFER_EMPLOYEEMASTER_GET_LIST = "Transfer/GetEmployeesList";
  public static HR_TRANSFER_LIST_BY_FILTER = "Transfer/GetTransferListByFilter";
  public static HR_TRANSFER_STATUS_GET_BY_ID = "Transfer/GetTransferDetailsById";
  public static HR_TRANSFER_STATUS_GET_BYEMPID = "Transfer/GetTransferStatusByEmpId";
  public static HR_TRANSFER_SAVE = "Transfer/Save";
  public static HR_TRANSFER_ADD_ATTACHMENTS = "Transfer/AddAttachments";
  public static HR_TRANSFER_SUBMIT_FOR_APPROVAL = "Transfer/SubmitForApproval";
  public static HR_TRANSFER_UPDATE_STATUS = "Transfer/UpdateTransferStatus";
  public static HR_TRANSFER_CONFIRM_JOINING = "Transfer/ConfirmTransferJoining";
  public static HR_TRANSFER_GET_DETAILS_BY_ID = "Transfer/GetTransferDetailsById";
  public static HR_TRANSFER_PENDING_TASKS = "Transfer/GetPendingTasks";
  public static HR_TRANSFER_APPROVE_TASK = "Transfer/ApproveTask";
  public static HR_TRANSFER_REJECT_TASK = "Transfer/RejectTask";
  public static HR_TRANSFER_GET_HISTORY_BY_EMP_ID = "Transfer/GetTransferHistory";
  public static HR_TRANSFER_GET_PRINT_TEMPLATES = "Transfer/GetPrintTemplates";

  public static HR_TRANSFER_GET_LETTER_FOR_PRINT = "Transfer/GetLetterForPrint";
  public static HR_TRANSFER_SEND_LETTER_EMAIL = "Transfer/SendLetterEmail";

  // Announcements
  public static HR_ANNOUNCEMENT_API = "Announcement";
  public static HR_ANNOUNCEMENT_GET_ALL = "Announcement/GetAll";
  public static HR_ANNOUNCEMENT_GET_BY_FILTER = "Announcement/GetByFilter";
  public static HR_ANNOUNCEMENT_SAVE_ANNOUNCEMENT_DETAILS = "Announcement/SaveAnnouncementDetails";
  public static HR_ANNOUNCEMENT_GET_TOP_ANNOUNCEMENTS = "Announcement/TopAnnouncements";
  public static HR_ANNOUNCEMENT_GET_ALL_ACTIVE_ANNOUNCEMENTS = "Announcement/GetAllActiveAnnouncements";

  // More Links
  public static HR_MORE_LINKS_API = "MoreLinks";
  public static HR_MORE_LINKS_GET_ALL_ACTIVE_MORE_LINKS = "MoreLinks/GetAllActiveMoreLinks";
  public static HR_MORE_LINKS_GET_ALL_ACTIVE_SOCIAL_LINKS = "MoreLinks/GetAllActiveSocialMediaLinks";

  // Confirmation Auto Initiation Config
  public static HR_CONFIRMATION_AUTO_INITIATION_CONFIG_API = "ConfirmationAutoInitiationConfig";
  public static HR_CONFIRMATION_AUTO_INITIATION_CONFIG_GET_BY_FILTER = "ConfirmationAutoInitiationConfig/GetByFilter";

  // Employee Rejoin Config
  public static HR_EMPLOYEE_REJOIN_CONFIG_API = "EmployeeRejoinConfig";
  public static HR_EMPLOYEE_REJOIN_CONFIG_GET_BY_FILTER = "EmployeeRejoinConfig/GetByFilter";
  // Employee Rejoin Exception
  public static HR_EMPLOYEE_REJOIN_EXECPTION_API = "EmployeeRejoinExpection";
  public static HR_EMPLOYEE_REJOIN_EXECPTION_ADD = "EmployeeRejoinExpection/Add";
  public static HR_EMPLOYEE_REJOIN_EXECPTION_GET_BY_FILTER = "EmployeeRejoinExpection/GetByFilter";

  public static LETTER_MAPPING_CONFIG_API = "LetterMappingConfig/Create";
    public static LETTER_MAPPING_CONFIG_API_UPDATE = "LetterMappingConfig/Update";
  public static LETTER_MAPPING_CONFIG_GET_BY_FILTER = "LetterMappingConfig/GetByFilter";
  public static LETTER_MAPPING_CONFIG_GET_TEMPLATES = "LetterMappingConfig/GetTemplates";

  public static UPDATE_SELECTED_EMPLOYEE = "Employee/UpdateSelectedEmployee";
  public static EMPLOYEE_GET_ACTIVE_EMPLOYEELIST = "Employee/GetActiveEmployeesByFilter";

  //EmailPreference
  public static EMAILPREFERENCE_GET_ALL_EMAILPREFERENCE = "EmailPreference/GetAllEmailPreferenceByEmployeeId";
  public static UPDATE_EMAILPREFERENCE = "EmailPreference/UpdateEmailPreferences";

  // Reports
  public static RESIGNATION_LIST_REPORT = "Resignation/GetResignationListReport";
  public static RESIGNATION_ATTIRATION_REPORT = "Resignation/GetResignationAttirationReport";

  //Update Emloyee Profile
  public static TEMPORARY_EMPLOYEE_PROFILE_SAVE = "TemporaryProfile/SaveDetails";
  public static TEMPORARY_EMPLOYEE_PROFILE_UPDATE = "TemporaryProfile/Update";
  public static TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS = "TemporaryProfile/GetProfileDetailsById";
  public static TEMPORARY_EMPLOYEE_PROFILE_SUBMIT_FOR_APPROVAL = "TemporaryProfile/SubmitForApproval";
  public static TEMPORARY_EMPLOYEE_PROFILE_PENDING_TASKS = "TemporaryProfile/GetPendingTasks";
  public static TEMPORARY_EMPLOYEE_PROFILE_LIST = "TemporaryProfile/GetProfileListByFilter";
  public static TEMPORARY_EMPLOYEE_APPROVE_TASK = "TemporaryProfile/ApproveTask";
  public static TEMPORARY_EMPLOYEE_REJECT_TASK = "TemporaryProfile/RejectTask";
  public static TEMPORARY_EMPLOYEE_PROFILE_GET_LIST = "TemporaryProfile/GetTemporaryEmployeeProfileLists";
  public static TEMPORARY_EMPLOYEE_PROFILE_GET_BY_EMPLOYEE_ID = "TemporaryProfile/GetProfileDetailsByEmployeeId";
  public static TEMPORARY_EMPLOYEE_PROFILE_ADD_ATTACHMENTS = "TemporaryProfile/AddAttachments";
  public static TEMPORARY_EMPLOYEE_GET_EMPLOYEE_LIST = "TemporaryProfile/GetEmployeesByFilter";
  public static TEMPORARY_EMPLOYEE_GET_HISTORY = "TemporaryProfile/GetProfileUpdatesHistory";


  //Approval Delegation
  public static APPROVAL_DELEGATION_GET_LIST_BY_EMP_ID = "ApprovalDelegation/GetDelegationsByEmployeeId";
  public static APPROVAL_DELEGATION_SAVE_DETAILS = "ApprovalDelegation/SaveApprovalDelegation";
  public static APPROVAL_DELEGATION_API = "ApprovalDelegation";

  //SMS Templates
  public static SMS_TEMPLATES_API = "SmsTemplates";

  //Admin
  public static ADMIN_SEND_EMAIL_NOTIFICATION_SELECTED_EMPLOYEE = "Admin/SendAdminEmailNotificationForSelectedEmployee";
  public static ADMIN_SEND_EMAIL_NOTIFICATION_ALL_EMPLOYEE = "Admin/SendAdminEmailNotificationForAllEmployee";
  public static ADMIN_GET_EMAIL_REQUESTS_BY_FILTER = "Admin/GetEmailRequestsByFilter";
  public static ADMIN_GET_EMAIL_MESSAGES_BY_REQUEST_ID = "Admin/GetEmailMessagesByRequestId";
  public static ADMIN_SEND_SMS_MESSAGES = "Admin/SendMassSMS";
  public static ADMIN_GET_SMS_REQUESTS_BY_FILTER = "Admin/GetSmsRequestsByFilter";
  public static ADMIN_GET_SMS_MESSAGES_BY_REQUEST_ID = "Admin/GetSmsMessagesByRequestId";

  public static TEMPORARY_PROFILE_ATTACHMENTS = "TemporaryProfile/AddAttachmentsEmployee";
  public static TEMPORARY_PROFILE_GET_ATTACHMENTS = "TemporaryProfile/GetAttachment";

  //Workflow
  public static WORKFLOW_GET_FLOW_TASKS_BY_FILTER = "Workflow/GetFlowTasksByFilter";
  public static WORKFLOW_CHECK_CAN_APPROVE_TASK = "Workflow/CanApproveTask";

  public static EMP_PPC_MASTER_ALL_LIST = "EmployeePPCMapping/GetAll";
  public static EMP_PPC_MASTER_INSERT = "EmployeePPCMapping";
  public static EMP_PPC_EMP_MASTER_INSERT = "EmployeePPCMapping/GetEmployeeList";
  public static EMP_PPC_MASTER_DELETE = "EmployeePPCMapping/Delete";


  public static BR_GET_ALLOWANCE_LIST = "AllowanceMaster/GetAll"
  public static BR_GET_ALLOWANCE_MAPPING_LIST = "AllowanceMapping/GetAll"
  public static BR_INSERT_ALLOWANCE_MAPPING = "AllowanceMapping"
  public static BR_ALLOWANCE = "AllowanceMaster"
  public static BR_GET_ALLOWANCE_LIST_BY_FILTER = "AllowanceMaster/GetByFilter";


  public static EMPLOYEE_GET_BIRTHDAYS_ANNIVERSARY_LIST = "EmployeeMaster/GetBirthdaysAndAnniversaryList";
  public static EMPLOYEE_GET_NEW_JOINERS_LIST = "EmployeeMaster/GetNewJoinersList";
  public static EMPLOYEE_GET_BIRTHDAYS_ANNIVERSARY_LIST_HR_EMPLOYEE = "EmployeeMaster/GetBirthdaysAndAnniversaryListFromHR_Employee";
  public static EMPLOYEE_GET_NEW_JOINERS_LIST_HR_EMPLOYEE = "EmployeeMaster/GetNewJoinersListFromHR_Employee";
  public static BR_SALARYHEAD = "SalaryStructure"
  public static BR_GET_SALARY_HEAD_LIST_BY_FILTER = "SalaryStructure/GetByFilter";
  public static BR_GET_SALARY_HEAD_LIST_ALL = "SalaryStructure/GetAll";

  public static BR_WORKFLOWAPPROVER = "WorkflowApproverMaster"
  public static BR_GET_WORKFLOW_APPROVER_LIST_BY_FILTER = "WorkflowApproverMaster/GetByFilter";
  public static HR_WORKFLOW_APPROVERS_BULK_UPLOAD = "WorkflowApproverMaster/BulkUploadWorkflowApprovers";
  public static HR_WORKFLOW_APPROVERS_REPLACE_APPROVER = "WorkflowApproverMaster/ReplaceApprover";
  public static HR_WORKFLOW_APPROVERS_UPDATE_APPROVER = "WorkflowApproverMaster/UpdateApprover";
  public static BR_DELETE_ALL_WORKFLOW_APPROVER = "WorkflowApproverMaster/DeleteAllApprovers"

  public static BR_CTC_FORMULA = "CtcFormula"
  public static BR_GET_CTC_FORMULA_LIST_BY_FILTER = "CtcFormula/GetByFilter";
  public static BR_GET_CTC_FORMULA_LIST_ALL = "CtcFormula/GetAll";

  public static BR_CHECKLISTCONFIG = "ChecklistConfig"
  public static BR_GET_CHECKLIST_CONFIG_LIST_BY_FILTER = "ChecklistConfig/GetByFilter";
  public static BR_DELETE_ALL_CHECKLIST_CONFIGS = "ChecklistConfig/DeleteAllChecklistConfigs"
  public static HR_CHECKLIST_CONFIGS_BULK_UPLOAD = "ChecklistConfig/BulkUploadChecklistConfigs";
  public static HR_CHECKLIST_CONFIG_UPDATE = "ChecklistConfig/UpdateChecklistConfig";

  public static BR_SIGNATORY_CONFIG = "SignatoryConfig"
  public static BR_GET_SIGNATORY_CONFIG_LIST_BY_FILTER = "SignatoryConfig/GetByFilter";
  public static BR_DELETE_ALL_SIGNATORY_CONFIGS = "SignatoryConfig/DeleteAllSignatories"
  public static HR_SIGNATORY_CONFIGS_BULK_UPLOAD = "SignatoryConfig/BulkUploadSignatories";
  public static HR_SIGNATORY_UPDATE = "SignatoryConfig/UpdateSignatory";
  public static HR_SIGNATORY_IMAGE_UPLOAD = "SignatoryConfig/AddAttachments";
  public static HR_SIGNATORY_GET_IMAGES="SignatoryConfig/GetFileNames"

  public static BR_ALLOWANCE_MAPPING_CONFIG = "AllowanceMapping"
  public static BR_GET_ALLOWANCE_MAPPING_CONFIG_LIST_BY_FILTER = "AllowanceMapping/GetByFilter";
  public static BR_GET_ALLOWANCE_MAPPING_CONFIG_GET_ALLOWANCE = "AllowanceMapping/GetAllowances";
  public static HR_ALLOWANCE_MAPPING_UPDATE = "AllowanceMapping/UpdateAllowanceMapping";

  public static BR_CTC_SLAB = "CtcSlabConfig"
  public static BR_GET_CTC_SLAB_LIST_BY_FILTER = "CtcSlabConfig/GetByFilter";
  public static HR_CTC_SLAB_CONFIG_UPDATE = "CtcSlabConfig/UpdateCtcSlabConfig";


  public static BR_PROFILE_PERMISSION_GET_PERMISSION_MASTER = "ProfilePermission/GetPermissionMasterList";
  public static BR_PROFILE_PERMISSION = "ProfilePermission";
  public static BR_PROFILE_PERMISSION_ADDORUPDATE = "ProfilePermission/AddUpdateProfilePermission";
  public static BR_PROFILE_PERMISSION_GET_ALL = "ProfilePermission/GetAll";
  //SAP Masters and UID

  //eMicro
  public static BR_MASTER_STORAGE_LOCATION_GETBYPARAM_API = "StorageLocation/GetByParam";
  public static BR_MASTER_STORAGE_LOCATION_ALL_API: string = "StorageLocation/GetAll";
  public static BR_MASTER_STORAGE_LOCATION_POST_PUT_API: string = "StorageLocation";
  public static BR_MASTER_PROCESS_GETBYPARAM_API = "ProcessMaster/GetByParam";
  public static BR_MASTER_PROCESS_ALL_API: string = "ProcessMaster/GetAll";
  public static BR_MASTER_PROCESS_POST_PUT_API: string = "ProcessMaster";
  public static BR_MASTER_MATERIAL_GROUP_GETBYPARAM_API = "MaterialGroup/GetByParam";
  public static BR_MASTER_MATERIAL_GROUP_ALL_API: string = "MaterialGroup/GetAll";
  public static BR_MASTER_MATERIAL_GROUP_POST_PUT_API: string = "MaterialGroup";
  public static BR_MASTER_COUNTRY_GETBYPARAM_API = "Country/GetByParam";
  public static BR_MASTER_COUNTRY_POST_PUT_API: string = "Country";
  public static BR_MASTER_PHARMA_GRADE_GETBYPARAM_API = "PharmaGrade/GetByParam";
  public static BR_MASTER_PHARMA_GRADE_ALL_API: string = "PharmaGrade/GetAll";
  public static BR_MASTER_PHARMA_GRADE_POST_PUT_API: string = "PharmaGrade";
  public static BR_MASTER_DMF_GRADE_GETBYPARAM_API = "DmfGrade/GetByParam";
  public static BR_MASTER_DMF_GRADE_ALL_API: string = "DmfGrade/GetAll";
  public static BR_MASTER_DMF_GRADE_POST_PUT_API: string = "DmfGrade";
  public static BR_MASTER_TEMP_COND_GETBYPARAM_API = "TempCondition/GetByParam";
  public static BR_MASTER_TEMP_COND_ALL_API: string = "TempCondition/GetAll";
  public static BR_MASTER_TEMP_COND_POST_PUT_API: string = "TempCondition";
  public static BR_MASTER_STORAGE_COND_GETBYPARAM_API = "StorageCondition/GetByParam";
  public static BR_MASTER_STORAGE_COND_ALL_API: string = "StorageCondition/GetAll";
  public static BR_MASTER_STORAGE_COND_POST_PUT_API: string = "StorageCondition";
  public static BR_MASTER_PURCHASE_GROUP_GETBYPARAM_API = "PurchaseGroup/GetByParam";
  public static BR_MASTER_PURCHASE_GROUP_ALL_API: string = "PurchaseGroup/GetAll";
  public static BR_MASTER_PURCHASE_GROUP_POST_PUT_API: string = "PurchaseGroup";
  public static BR_MASTER_BRAND_GETBYPARAM_API = "Brand/GetByParam";
  public static BR_MASTER_BRAND_ALL_API: string = "Brand/GetAll";
  public static BR_MASTER_BRAND_POST_PUT_API: string = "Brand";
  public static BR_MASTER_STRENGTH_GETBYPARAM_API = "Strength/GetByParam";
  public static BR_MASTER_STRENGTH_ALL_API: string = "Strength/GetAll";
  public static BR_MASTER_STRENGTH_POST_PUT_API: string = "Strength";
  public static BR_MASTER_DIVISION_ALL_API: string = "Division/GetAll";
  public static BR_MASTER_DIVISION_POST_PUT_API: string = "Division";
  public static BR_MASTER_GENERIC_NAME_ALL_API: string = "GenericName/GetAll";
  public static BR_MASTER_GENERIC_NAME_POST_PUT_API: string = "GenericName";
  public static BR_MASTER_PACK_SIZE_ALL_API: string = "PackSize/GetAll";
  public static BR_MASTER_PACK_SIZE_POST_PUT_API: string = "PackSize";
  public static BR_MASTER_PACK_TYPE_ALL_API: string = "PackType/GetAll";
  public static BR_MASTER_PACK_TYPE_POST_PUT_API: string = "PackType";
  public static BR_MASTER_VALUATION_CLASS_ALL_API: string = "ValuationClass/GetAll";
  public static BR_MASTER_VALUATION_CLASS_POST_PUT_API: string = "ValuationClass";
  public static BR_MASTER_APPROVERS_ALL_API: string = "WorkFlowApprovers/GetAll";
  public static BR_MASTER_APPROVERS_POST_PUT_API: string = "WorkFlowApprovers";
  public static BR_MASTER_APPROVERS_GET_CREATORS_LIST_API: string = "WorkFlowApprovers/GetCreatorList";

  public static BR_ITEMCODE_APPROVAL_TRANSACTIONS_HISTORY_API = "ApprovalTransactions/GetTransactionHistory";

  public static BR_ITEMCODE_REQUEST_FILTER_API = "ItemCodeRequest/GetItemCodeRequestByFilter";
  public static BR_ITEMCODE_REQUEST_POST_API = "ItemCodeRequest";
  public static BR_ITEMCODEREQUEST_CREATESAVEDENTRY = "ItemCodeRequest/CreateSavedEntry";
  public static BR_ITEMCODE_APPROVAL_TRANSACTIONS_POST_API = "ApprovalTransactions";
  public static BR_ITEMCODE_APPROVERS_GET_ALL = "WorkFlowApprovers";
  public static BR_ITEMCODE_APPROVERS_GETBY_PARAM_ALL = "WorkFlowApprovers/GetByParam";
  public static BR_ITEMCODE_APPROVAL_TRANSACTIONS_GETBY_PARAM_API = "ApprovalTransactions/GetByParam";
  public static BR_SEND_ITEM_CODEREQUEST_EMAIL_API = "Email/senditemcoderequestemail";
  public static BR_ITEMCODE_REQUEST_GETBY_PARAM_API = "ItemCodeRequest/GetByParam";
  public static BR_ITEMCODE_REQUEST_GET_CODES_API = "ItemCodeRequest/GetAllItemCodes";
  public static BR_ITEMCODE_DATA = "ItemCodeRequest/GetItemCodeData";


  public static BR_ITEMCODE_REQUEST_GETBY_ID_API = "ItemCodeRequest/GetByAny";


  public static BR_SERIALIZATION_DATA_GETBY_PARAM_API = "GlobalSerialization/GetByParam";
  public static BR_MASTER_THERAPEUTIC_SEGMENT_ALL_API: string = "TherapeuticSegment/GetAll";
  public static BR_ITEMCODE_EXTENSION_POST_API = "ItemcodeExtenstionRequest";
  public static BR_ITEMCODE_EXTENSION_FILTER_API = "ItemcodeExtenstionRequest/GetItemcodeExtenstionByFilter";

  public static BR_PRINT_PASS_API = "Visitor/PrintVisitorPass";
  public static BR_PUT_MULTIPLE_REQUESTS_API = "ItemCodeRequest/Save";
  public static BR_UPDATE_MULTIPLE_REQUESTS_API = "ItemCodeRequest/Update";

  public static BR_GET_MASTERS_DATA_API = "ItemCodeRequest/GetMasterData";
  public static BR_CUSTOMER_MASTER_FILTER_API = "CustomerMasterM/GetCustomerDetailsByFilter";
  public static BR_VENDOR_MASTER_FILTER_API = "VendorMaster/GetVendorDetailsByFilter";
  public static BR_SERVICE_MASTER_FILTER_API = "ServiceMaster/GetServiceDetailsByFilter";
  public static BR_VENDOR_MASTER_CREATION_POST_API = "VendorMaster";
  public static BR_VENDOR_MASTER_CREATESAVEDENTRY = "VendorMaster/CreateSavedEntry";
  public static BR_CUSTOMER_MASTER_POST_API = "CustomerMasterM";
  public static BR_CUSTOMER_MASTER_CREATESAVEDENTRY = "CustomerMasterM/CreateSavedEntry";
  public static BR_SERVICE_MASTER_POST_API = "ServiceMaster";
  public static BR_SERVICE_MASTER_CREATESAVEDENTRY = "ServiceMaster/CreateSavedEntry";
  public static BR_ACC_CLERCK_POST_API = "AccClerkM/GetAll";
  public static BR_ACCOUNT_GROUP_POST_API = "AccountGroupM/GetAll";
  public static BR_CURRENCY_POST_API = "Currency/GetAll";
  public static BR_PAYMENT_TERM_POST_API = "PaymentTermM/GetAll";
  public static BR_RECONCILIATION_ACC_POST_API = "ReconciliationAccountM/GetAll";
  public static BR_TDS_SECTION_POST_API = "TdsSectionM/GetAll";
  public static BR_VENDOR_TYPE_POST_API = "VendorType/GetAll";
  public static BR_STATE_POST_API = "State/GetAll";
  public static BR_CUSTOMER_GROUP_POST_API = "CustomerGroup/GetAll";
  public static BR_PRICE_GROUP_POST_API = "PriceGroup/GetAll";
  public static BR_PRICE_LIST_POST_API = "PriceList/GetAll";
  public static BR_SERVICE_GROUP_POST_API = "ServiceGroup/GetAll";
  public static BR_SERVICE_CATEGORY_POST_API = "ServiceCategory/GetAll";
  public static BR_TAX_CLASS_POST_API = "TaxClass/GetAll";
  public static BR_SEND_VENDOR_MASTER_EMAIL_API = "Email/sendvendormasteremail";
  public static BR_SEND_CUSTOMER_MASTER_EMAIL_API = "Email/sendcustomermasteremail";
  public static BR_SEND_SERVICE_MASTER_EMAIL_API = "Email/sendservicemasteremail";

  public static BR_MASTER_REPORT_FILTER_API = "ServiceMaster/GetMastersReportByFilter";
  public static BR_GET_MASTERS_LIST_API = "ServiceMaster/GetMastersList"

  public static BR_SEND_ITEM_CODE_PENDING_EMAIL_API = "Email/sendpendingemail";
  public static BR_SEND_VENDOR_MASTER_PENDING_EMAIL_API = "Email/sendvendorpendingemail";
  public static BR_SEND_CUSTOMER_MASTER_PENDING_EMAIL_API = "Email/sendcustomerpendingemail";
  public static BR_SEND_SERVICE_MASTER_PENDING_EMAIL_API = "Email/sendservicependingemail";

  public static BR_SEND_ITEM_CODE_EXTENSION_EMAIL_API = "Email/senditemcodeextensionemail";
  public static BR_SEND_ITEM_CODE_EXTENSION_PENDING_EMAIL_API = "Email/sendextensionpendingemail";

  public static BR_SEND_ITEM_CODE_MOD_EMAIL_API = "Email/senditemcodemodemail";
  public static BR_SEND_ITEM_CODE_MOD_PENDING_EMAIL_API = "Email/sendmodpendingemail";

  public static BR_RFCBAPI_CODE_CREATION__API = "CodeCreation";
  public static BR_GET_SAP_MASTER_COUNT = "VendorMaster/GetMasterCount"


  public static BR_ITEMCODE_MODIFICATION_API = "ItemCodeModification/GetAll";
  public static BR_ITEMCODE_MODIFICATION_INSERT_API = "ItemCodeModification";
  public static BR_ITEMCODE_MODIFICATION_FILTER_API = "ItemCodeModification/GetApprovers";
  public static BR_ITEMCODE_MODIFICATION_FILTER_DATA_API = "ItemCodeModification/GetFilteredData";
  public static BR_ITEMCODE_MODIFICATION_CODE_API = "ItemCodeModification/GetApproversLatest";


  public static BR_ITEMCODE_REQUEST_GETBY_CODE_API = "MaterialCodeSearch/GetByParam";

  public static BR_MASTER_SAP_FILEUPLOAD_API: string = "SAPFileUpload";
  public static BR_SAP_FILEDOWNLOAD_API = "SapFileDownload";


  //UID
  public static BR_SOFTWARE_API: string = "Softwares/GetAll";
  public static BR_SOFTWARE_INSERT_API: string = "Softwares";
  public static BR_SOFTWARE_ROLES_API: string = "SoftwaresRoles/GetAll";
  public static BR_SOFTWARE_ROLES_INSERT_API: string = "SoftwaresRoles";
  public static BR_USER_GROUPS_API: string = "UserGroupsMaster/GetAll";
  public static BR_USER_GROUPS_INSERT_API: string = "UserGroupsMaster";
  public static BR_USER_SUB_GROUPS_API: string = "UserSubGroupsMaster/GetAll";
  public static BR_USER_SUB_GROUPS_INSERT_API: string = "UserSubGroupsMaster";
  public static BR_SOFTWARE_MODULES_API: string = "SoftwareModules/GetAll";
  public static BR_SOFTWARE_MODULES_INSERT_API: string = "SoftwareModules";
  public static BR_SOFTWARE_USER_PROFILES_API: string = "SoftwareUserProfiles/GetAll";
  public static BR_SOFTWARE_USER_PROFILES_INSERT_API: string = "SoftwareUserProfiles";
  public static BR_REPOSITORY_DOMAINS_API: string = "RepositoryDomains/GetAll";
  public static BR_REPOSITORY_DOMAINS_INSERT_API: string = "RepositoryDomains";

  public static BR_USERID_REQUEST_API: string = "UserIdRequest/GetAll";
  public static BR_USERID_REQUEST_INSERT_API: string = "UserIdRequest";
  public static BR_USERID_REQUEST_INSERT_API_MULTIPLE: string = "UserIdRequest/Save";
  public static BR_USERID_REQUESTS_FILTER_API = "UserIdRequest/GetUserIdRequestByFilter";
  public static BR_USERID_REQUESTS_GET_BY_PARAM_API = "UserIdRequest/GetByParam";

  public static BR_GET_EMP_DETAILS_API = "EmployeeMaster/GetEmpDetails";
  public static BR_SEND_MAIL_API = "UserIdRequest/SendMail";
  public static BR_USER_ID_REQUEST_APPROVER_API: string = "UserIdRequest/GetApprover";
  public static BR_SEND_PEND_MAIL_API = "UserIdRequest/SendPenMail";

  //lockout
  public static BR_MASTER_LOCKOUT_API = "LockoutMaster/GetAll";
  public static BR_MASTER_LOCKOUT_BYID_API = "LockoutMaster";
  public static BR_MASTER_LOCKOUT_BY_PARAM_API = "LockoutMaster/GetByParam";

  public static BR_GET_EMP_DETAILS = "EmployeeMaster/GetEmpMasterDetails";

  public static BR_PRINT_LOG_INSERT = "PrintingLog";
  public static BR_PRINT_LOG_REPORT = "PrintingLog/GetAuditReportByFilter";

  public static BR_UPDATE_USER_LOG: string = "TblUserLog";
  public static BR_AUDITLOG_MASTERS_LIST: string = "AuditLogMasterList/GetAll";





  //ITAMS
  public static BR_GET_AMS_CAT_MASTER: string = "Category/GetAll";
  public static BR_GET_AMS_ASSET_STATE_MASTER: string = "AssetState/GetAll";
  public static BR_GET_AMS_ASSET_DETAILS_MASTER: string = "NewItassetDetailsDesktop/GetAll";
  public static BR_GET_AMS_STORAGE_SIZE_MASTER: string = "StorageSize/GetAll";
  public static BR_GET_AMS_SOFTWARE_TYPE_MASTER: string = "SoftwareType/GetAll";
  public static BR_GET_AMS_LICENSE_TYPE_MASTER: string = "LicenseType/GetAll"
  public static BR_GET_AMS_ASSET_DATA_MASTER: string = "NewItassetDetailsDesktop/GetByParam"
  public static BR_GET_AMS_ASSET_DATA = "NewItassetDetailsDesktop/Create";
  public static BR_AMS_MAIL_FOR_NEW_ASSET: string = "Email/SendNewAssetCreationMail";
  public static BR_GET_AMS_TRANSFERRED_ASSET: string = "NewItassetDetailsDesktop/GetTransferredAssetData";

  public static BR_GET_AMS_ASSET_HARD_SUMMARY: string = "NewItassetDetailsDesktop/GetAssetHardwareSummary";
  public static BR_GET_AMS_ASSET_HARD_DETAIL: string = "NewItassetDetailsDesktop/GetAssetHardwareDetail";
  public static BR_GET_AMS_ASSET_SOFT_SUMMARY: string = "OtherSoftwares/GetAssetSoftwareSummary";
  public static BR_GET_AMS_ASSET_SOFT_DETAIL: string = "OtherSoftwares/GetAssetSoftwareDetail";
  public static BR_GET_AMS_EMP_ASSET_DETAILS: string = "NewItassetDetailsDesktop/GetEmpAssetData";
  public static BR_AMS_ACKNOWLEDGE_ASSET: string = "NewItassetDetailsDesktop/AcknowledgeAsset";
  public static BR_AMS_SPOC_DETAILS_INSERT: string = "SpocDetails";
  public static BR_AMS_SPOC_DETAILS_UPDATE: string = "SpocDetails";
  public static GET_AMS_PLANT_IT_CONTACTS: string = "SpocDetails/GetAll";
  public static GET_AMS_APPROVE_ASSET: string = "NewItassetDetailsDesktop";
  public static BR_AMS_TRANSFER_UTU_ASSET_DATA: string = "NewItassetDetailsDesktop/TransferAssetUTU";
  public static BR_AMS_UPDATE_ASSET_DATA: string = "NewItassetDetailsDesktop/ChangeAssetDetails";
  public static BR_AMS_TRANSFER_LTL_ASSET_DATA: string = "NewItassetDetailsDesktop/TransferAssetLTL";
  public static GET_AMS_APPROVE_ASSETLTL: string = "NewItassetDetailsDesktop/ApproveAssetLTL";
  public static BR_GET_AMS_SOFTWARE_LIST: string = "OtherSoftwares/GetByParam"

  public static BR_GET_AMS_ASSET_HARD_DETAILED: string = "NewItassetDetailsDesktop/GetAssetHardwareDetailed";
  public static BR_GET_AMS_ASSET_DETAILS: string = "NewItassetDetailsDesktop/GetAssetDetails";
  public static BR_GET_AMS_ASSET_SOFT_DETAILED: string = "OtherSoftwares/GetAssetSoftwareDetailed";
  public static BR_GET_AMS_ASSET_HARDWARE: string = "NewItassetDetailsDesktop/GetHardware";
  public static BR_GET_AMS_ASSET_SOFTWARE: string = "OtherSoftwares/GetSoftware";
  public static BR_GET_AMS_MONITOR_TYPE_MASTER: string = "MonitorType/GetAll";
  public static BR_GET_AMS_SPARES_RECEIPT: string = "SparesReceipt/GetAssetSparesReceipt";
  public static BR_GET_AMS_RECEIPT_DATA = "SparesReceipt";
  public static BR_GET_AMS_SPARES_REQUEST: string = "SparesRequest/GetAssetSparesRequest";
  public static BR_GET_AMS_REQUEST_APPROVE = "SparesRequest";
  public static BR_GET_AMS_PRINTER_MASTER = "NewItassetDetailsDesktop/PrinterList";
  public static BR_GET_AMS_PRINTED_LABEL = "NewItassetDetailsDesktop/PrintLabel";
  public static BR_GET_AMS_APPROVER_DET = "NewItassetDetailsDesktop/GetApprover";
  public static BR_GET_AMS_DISPOSE_ASSET = "NewItassetDetailsDesktop/DisposeAsset";
  public static BR_GET_AMS_ASSET_DASHBOARD_COUNT = "NewItassetDetailsDesktop/DashboardCount";
  public static BR_GET_AMS_ASSET_SEARCH_DATA = "NewItassetDetailsDesktop/GetAssetData";
  public static BR_AMS_AUDITLOG_GetBYPARAM_API: string = "AuditLogAMS/GetByParam";
  public static BR_AMS_RETIRE_ASSET = "NewItassetDetailsDesktop/RetireAsset";


  public static BR_EMPLOYEEMASTER_ACTIVE_API_GET: string = "EmployeeMaster/GetActiveEmployees";

  //MLLDLS
  public static BR_GET_TYP_CAT_MASTER: string = "TypeCatMst/GetAll"
  public static BR_MASTER_TYP_CAT_MASTER_INSERT = "TypeCatMst";
  public static BR_GET_TYP_CAT_GET_BYPARAM_MASTER: string = "TypeCatMst/GetByParam"



  public static BR_GET_RETENTION_MASTER: string = "RetentionMaster/GetAll"
  public static BR_MASTER_RETENTION_MASTER_INSERT = "RetentionMaster";
  public static BR_GET_DOCK_RACK_MASTER: string = "DocRackMaster/GetAll"
  public static BR_MASTER_DOCK_RACK_MASTER_INSERT = "DocRackMaster";
  public static BR_LOC_RACK_DETAILS_MASTER: string = "LocRackDet/GetAll"
  public static BR_LOC_RACK_DETAILS_MASTER_INSERT = "LocRackDet";
  public static BR_DOC_CREATE_GET_MASTER: string = "DocCreate/GetAll"
  public static BR_DOC_CREATE_MASTER_INSERT = "DocCreate";
  public static BR_DOC_CREATE_REQUEST_INSERT = "DocCreate/SaveRequest";
  public static BR_DOC_CREATE_REQUEST_FILTER = "DocCreate/GetDocRequestByFilter";
  public static BR_GET_DOC_APPROVERS = "DocumentApprovers/GetByParam"

  public static BR_DOC_CREATE_REQUEST_UPDATE = "DocCreate/UpdateRequest";
  public static BR_DOC_CREATE_HISTORY = "DocCreate/GetDocHistory";
  public static BR_GET_DLS_REPORT_DATA = "DocCreate/GetDocListReport";
  public static BR_GET_DLS_TRANS_REPORT_DATA = "DocCreate/GetDocTranReport";

  public static BR_DOC_BORROW_REQUEST_INSERT = "DocBorrow/SaveRequest";
  public static BR_DOC_BORROW_HISTORY = "DocBorrow/GetDocHistory";
  public static BR_DOC_BORROW_REQUEST_UPDATE = "DocBorrow/UpdateRequest";
  public static BR_DOC_BORROW_REQUEST_FILTER = "DocBorrow/GetDocRequestByFilter";

  public static BR_GET_SUBSTITUTE_RECORDS_INSERT = "DocBorrow/GetSubRecords";
  public static BR_DOC_SUBSTITUTE_REQUEST_INSERT = "DocBorrow/DLSSubstitute";

  public static BR_GET_DOC_CAT_MASTER: string = "DocCategory/GetAll"
  public static BR_MASTER_DOC_CAT_MASTER_INSERT = "DocCategory";
  public static BR_MASTER_DOC_APPROVER_INSERT = "DocumentApprovers";
  public static BR_GET_DOC_APPROVER: string = "DocumentApprovers/GetAll";
  public static BR_DOC_BORROW_ISSUE = "DocBorrow/GetDocIssue";
  public static BR_DOC_DEST_REQUEST_FILTER = "DocDestructionMaster/GetDocRequestByFilter";
  public static BR_DOC_DESTR_REQUEST_INSERT = "DocDestructionMaster/SaveRequest";
  public static BR_DOC_DESTR_REQUEST_UPDATE = "DocDestructionMaster/UpdateRequest";
  public static BR_DOC_DEST_APPROVERS = "DocumentDestructionApprovers/GetByParam";
  public static BR_DOC_DESTRUCTION_HISTORY = "DocDestructionMaster/GetDocHistory";

  public static BR_DOC_DEST_FILTER = "DocDestructionMaster/GetDocDestFilter";

  public static BR_BOX_DETAILS_GETBYPARAM_API = "BoxBarcode/GetByParam";
  public static BR_BOX_DETAILS_INSERT_API = "BoxBarcode";
  public static BR_BOX_DETAILS_GET_API = "BoxBarcode/GetAll";
  public static BR_BOX_DETAILS_GET_LOC_API = "BoxBarcode/GetBoxList";
  public static BR_LOC_RACK_DETAILS_GETBYPARAM = "LocRackDet/GetByParam";
  public static BR_BOX_DETAILS_GET_ADD_API = "BoxBarcode/GetBoxDetails";
  public static BR_DOC_CREATE_GETBYPARAM = "DocCreate/GetByParam";
  public static BR_BOX_DETAILS_GET_PAGED_API = "BoxBarcode/GetPaged";

  //Travel Desk
  public static BR_GET_TRAVEL_REPORT_DATA = "TdTravelExpenseDetails/GetReportData"
  public static BR_POST_TRAVEL_REPORT_DATA = "TdTravelExpenseDetails/GetReportData"


  public static BR_POST_TRAVEL_BALANCE = "TdTravelBalance/SubmitToAcc";
  public static BR_POST_TRAVEL_PAYMENT = "TdTravelPaymentDetails/SubmitPaymentDetails"
  public static BR_GET_TRAVEL_PAYMENT = "TdTravelExpenseDetails/GetDetailsForPaymentSubmission"
  public static BR_UPLOAD_EXCELFILE_TX = "TdTravelExpenseDetails/InsertTravelExpense";
  public static BR_GET_DASHBOARD = "TdTravelExpenseDetails/GetDataForDashboard";
  public static BR_GET_TYPEOFEVENT = "TypeOfEvent/GetAll";
  public static BR_EXPENSE_REPORT_API = "TdTravelExpenseDetails/GetByAny";

  public static BR_GET_TDVENDOR_DETAILS_API = "TdVendorMaster/GetAll";

  public static BR_TDVENDOR_MASTER_ALL_API: string = "TdVendorMaster/GetAll";

  public static BR_TDVENDOR_MASTER_POST_PUT_API: string = "TdVendorMaster";
  public static BR_TDTYPEOFEVENT_MASTER_ALL_API: string = "TypeOfEvent/GetAll";
  public static BR_TDTYPEOFEVENT_MASTER_POST_PUT_API: string = "TypeOfEvent";

  public static BR_GET_TYPE_OF_GUEST = "TypeOfGuest/GetAll";
  public static BR_GET_PURPOSE = "PurposeTravel/GetAll";
  public static BR_GET_EXPENSE_CATEGORY = "ExpenseCategory/GetAll";
  public static BR_GET_VENDOR_DETAILS_API = "VendorMaster/GetAll";
  public static BR_POST_TRAVEL_EXPENSE = "TdTravelExpenseDetails";
  public static BR_GET_TRAVEL_EXPENSE = "TdTravelExpenseDetails/GetSelected";
  public static BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_NAME: string = "EmployeeMaster/GetEmployeeByName";
  public static BR_EMPLOYEEMASTER_ACTIVE_API_GET_BY_ID: string = "EmployeeMaster/GetEmployeeById";
  public static BR_PUT_EXPENSEUPDATE = "TypeOfEvent/id";

  public static BR_PUT_TDEXPENSEUPDATE = "TdTravelExpenseDetails"
  public static GET_BALANCE_DETAILS_BY_ID = "TdTravelBalance/GetByAny";
  public static GET_EXPENSE_DETAILS_BY_PARAM = "TdTravelExpenseDetails/GetByParam";
  public static BR_EXPENSE_DETAILS_DEL = "TdTravelExpenseDetails";
  public static BR_BALANCE_DETAILS_UPDATE = "TdTravelBalance/SaveEdited";
  public static BR_BALANCE_DETAILS_LAST_DEL_ = "TdTravelBalance";
  public static BR_GET_TRAVEL_FIN_REPORT_DATA = "TdTravelExpenseDetails/GetFinancialReportData";


  //WMTS

  public static BR_GET_PIM_DATA: string = "TblSapwmtracking/GetData";
  //public static BR_GET_PIM_DATA: string = "TblSapwmtracking/GetDataLatest";
  public static BR_GET_PIM_ITEM_DATA: string = "TblSapwmtracking/GetPimData";
  public static BR_GET_PIM_POST_MIGO_DATA: string = "TblSapwmtracking/Post";
  public static BR_GET_PIM_POST_DC_DATA: string = "TblDcdetails/PostDC";
  public static BR_GET_DC_DATA: string = "TblDcdetails/GetDCData";
  public static BR_GET_INWARD_REPORT_DATA: string = "TblSapwmtracking/GetInwardReport";
  public static BR_GET_USER_BASED_REPORT_DATA: string = "TblSapwmtracking/GetUserBasedReport";
  public static BR_GET_STOCK_VER_REPORT_DATA: string = "TblSapwmtracking/GetStockVerReport";
  // public static BR_UPDATE_USER_LOG: string = "TblUserLog";
  public static BR_GET_OUTWARD_REPORT_DATA: string = "TblDcdetails/GetOutwardReport";
  public static BR_GET_DCLOOSETRANSFER_DATA: string = "TblSapwmtracking/GetDCLooseData";
  public static BR_GET_DC_CANCELLATION_DATA: string = "TblDcdetails/GetDCDataForCancellation";

  public static BR_GET_SPACE_UTILISATION_REPORT: string = "TblSapwmtracking/GetSpaceUtilisation"
  public static BR_GET_SHIPPERS_DC_CANCELLATION: string = "TblDcdetails/GetShippersData";
  public static BR_CANCEL_DC_LINTE_ITEM_CHANGE: string = "TblDcdetails/CancelDCLineItemChange"
  public static BR_CANCEL_DC_LINTE_ITEM: string = "TblDcdetails/CancelDCLineItem"
  public static BR_CANCEL_FULL_DC: string = "TblDcdetails/CancelFullDC"
  public static BR_GET_SECURITY_VERIFICATION_DATA: string = "TblSapwmtracking/GetSecurityVerificationData";
  public static BR_GET_PICKING_REPORT: string = "TblDcdetails/GetPickedReport"
  public static BR_GET_GATE_PASS: string = "TblDcdetails/GetGatePass";
  public static BR_GET_DC_VERIFICATIO_REPORT: string = "TblDcdetails/GetDCVerificationReport"
  public static BR_GET_DC_POSTED_DATA: string = "TblDcdetails/GetDCPostedData";
  public static BR_GET_SAMPLING_DATA: string = "TblSapwmtracking/GetSamplingData";
  public static BR_GET_MONTHEND_DC_DATA: string = "TblDcdetails/GetMonthEndDCData";
  public static BR_APPROVE_MONTHEND_DC: string = "TblDcdetails/ApproveMonthEndDC";
  public static BR_GET_STOCKREPORT: string = "TblSapwmtracking/GetStockReport";


  //Phase2 

  public static BR_GET_VMS_APPROVERS: string = "VmsApprovalM/GetByParam";
  public static BR_GET_VISITOR_BASED_ON_NAME: string = "Visitor/GetVisitorsBasedOnName"
  public static BR_SEND_VISITOR_APPROVAL_MAIL: string = "Email/sendvisitorapprovalmail";
  public static BR_GET_EMPLOYEE_BASED_ON_SEARCHTEXT: string = "EmployeeMaster/GetEmployeesList";
  public static BR_UPDATE_HISTORY: string = "AllRequestHistory";
  public static INSERT_VISITOR_BELONGINGS: string = "BelongingsChecklist/InsertBelongings"
  public static GET_VISITOR_BELONGINGS: string = "BelongingsChecklist/GetByAny";
  public static UPDATE_VISITOR_BELONGINGS: string = "BelongingsChecklist";
  public static GET_PLANT_ADDRESS_DETAILS: string = "PlantAddress/GetByParam"
  public static UPDATE_AMC_VISIT_DETAILS: string = "AmcvisitDetails";
  public static GET_AMC_VISIT_DETAILS_BY_ID: string = "AmcvisitDetails/GetByAny";
  public static GET_GATE_ENTRY_DASHBOARD_DATA: string = "GateOutwardM/GEDashboardData";
  public static GET_USERIDREQUEST_PAGINATION: string = "UserIdRequest/GetPaged";

  public static INSERT_TRANSACION_HISTORY: string = "ApprovalTransactions/InsertHistory";
  public static GET_REQUEST_HISTORY = "ApprovalTransactions/GetHistory";
  public static BR_SEND_PEND_MAIL_API_NEW = "Email/SendUIDPendingApprovalMail";
  public static BR_SEND_APPROVED_MAIL_API_NEW = "Email/SendUIDApprovedMail";
  public static BR_SEND_REJECTED_MAIL_API_NEW = "Email/SendUIDRejectedMail";

  public static GET_USER_REPORT_DATA: string = "UserIdRequest/GetFilteredList";
  public static USERID_BULK_UPLOAD: string = "UserIdRequest/BulkUploadUserIds";
  public static USERID_EQUIPDETAILS_INSERT: string = "UserIdEquipmentDetails";
  public static USERID_EQUIPDETAILS_GETBYID: string = "UserIdEquipmentDetails/GetByAny";
  public static USERID_REQUEST_SUMMARY_REPORT: string = "UserIdRequest/GetSummaryReport";
  public static USERID_REQUEST_DETAILED_REPORT: string = "UserIdRequest/GetDetailedReport";
  public static USERID_REQUEST_BULK_UPLOAD_HISTORY: string = "UserIdRequest/ViewHistory";
  public static INSERT_SAP_TRANSACION_HISTORY: string = "ApprovalTransactions/InsertSAPHistory";
  public static GET_SAP_REQUEST_HISTORY = "ApprovalTransactions/GetSAPHistory";

  public static GET_DETAILED_HISTORY = "UserIdRequest/GetDetailedHistory"

  public static UPDATE_STATUS_OF_BULK_APPROVE = "UserIdMasterDetails";
  public static BR_FINANCE_APPROVAL_API = "ItemCodeRequest/FinanceApprovalUpdate"

  // Customer Master Changes  
  public static BR_CUSTOMERMASTERCHANGES_APPROVERS_GETBY_PARAM_ALL = "CustomerMasterM/GetByParam";
  public static BR_CUSTOMER_MASTER_CHANGES_POST_API = "CustomerMasterChanges";
  public static BR_CUSTOMER_MASTER_CHANGES_GET_API = "CustomerMasterChanges/GetAll";
  public static GET_FILTERED_RESULT_OF_CMC = "CustomerMasterChanges/GetFilteredData";
  public static BR_VENDOR_MASTERCHANGES_APPROVERS_GETBY_PARAM_ALL = "VendorMaster/GetByParam";
  public static BR_VENDOR_MASTER_CHANGES_GET_API = "VendorMasterChanges/GetAll";
  public static BR_VENDOR_MASTER_CHANGES_CREATION_POST_API = "VendorMasterChanges";
  public static GET_FILTERED_RESULT_OF_VMC = "VendorMasterChanges/GetFilteredData";
  public static BR_SERVICE_MASTERCHANGES_APPROVERS_GETBY_PARAM_ALL = "ServiceMaster/GetByParam";
  public static BR_SERVICE_MASTER_CHANGES_GET_API = "ServiceMasterChanges/GetAll";
  public static BR_SERVICE_MASTER_CHANGES_POST_API = "ServiceMasterChanges";
  public static BR_SERVICE_MASTER_CHANGE_POST_API = "ServiceMasterChanges";
  public static GET_FILTERED_RESULT_OF_SMC = "ServiceMasterChanges/GetFilteredData";
  public static BR_SOFTWARE_BYPARAM_API: string = "Softwares/GetByParam";
  public static BR_USERID_MASTERS_GET_BY_PARAM_API = "UserIdMasterDetails/GetByParam";


  public static UPLOAD_SOFTWARE_ROLES = "SoftwaresRoles/InsertSoftwareRoles";
  public static BR_UPLOAD_EXCELFILE_VM = "VendorMaster/InsertVendorMaster";
  public static BR_UPLOAD_EXCELFILE_CM = "CustomerMasterM/InsertCutomerMaster";
  public static BR_UPLOAD_EXCELFILE_SM = "ServiceMaster/InsertServiceMaster";

  public static BR_INSERTSERVICEMASTER = "InsertServiceMaster";
  public static BR_INSERTCUSTOMERMASTER = "InsertCustomerMaster";
  public static BR_INSERTVENDORMASTER = "InsertVendorMaster";

  public static BR_UPDATE_BULKVM = "VendorMaster/UpdateBulkRequest";
  public static BR_UPDATE_BULKCS = "CustomerMasterM/UpdateBulkRequest";
  public static BR_UPDATE_BULKSR = "ServiceMaster/UpdateBulkRequest";
  public static SEND_CUSTOMER_MOD_MAIL = "Email/SendCustomerModMail";
  public static SEND_VENDOR_MOD_MAIL = "Email/SendVendorModMail";
  public static SEND_SERVICE_MOD_MAIL = "Email/SendServiceModMail";

  public static SEND_CUSTOMER_APPROVED_MOD_MAIL = "Email/SendCustomerModComMail";
  public static SEND_VENDOR_APPROVED_MOD_MAIL = "Email/SendVendorModComMail";
  public static SEND_SERVICE_APPROVED_MOD_MAIL = "Email/SendServiceModComMail";

  public static GET_PENDING_COUNT = "AllRequestHistory/GetPendingCount"
  public static GET_VISITOR_FOR_APPROVAL = "Visitor/GetVisitorsforApproval";

  public static BR_APPROVE_VISITOR: string = "Visitor/ApproveVisitor";

  //Email Template
  public static EMAIL_TEMPLATE_LIST = "EmailTemplate/GeEmailTemplateListByFilter";
  public static EMAIL_TEMPLATE_UPDATE = "EmailTemplate/Update";

  //Letter Template
  public static LETTER_TEMPLATE_LIST = "PrintTemplate/GetPrintTemplateListByFilter";
  public static LETTER_TEMPLATE_CREATE = "PrintTemplate/Create";
  public static LETTER_TEMPLATE_UPDATE = "PrintTemplate/Update";
  
  public static BR_EMPLOYEEPROFILECONFIG = "EmployeeProfileConfig";
  public static BR_EMPLOYEEPROFILECONFIG_GETBYPARAM = "EmployeeProfileConfig/GetByParam";
}
