import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
//import { HttpClient } from '@angular/common/http';

import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';
import { Util } from '../../Services/util.service';
import { PERMISSIONS } from '../../../shared/permissions';
import { HttpClient } from '@angular/common/http';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-confirmation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [Util]
})
export class ListComponent implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService, private http: HttpClient, private util: Util) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  currentUser: AuthData;
  isLoading: boolean = false;
  employeeId: number;
  filterData: any = {};
  filterModel: any = {};
  plantlist: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  action: string;
  comment: string;
  earningHeads: any[] = [];
  deductionHeads: any[] = [];
  reimbursementHeads: any[] = [];
  benefitHeads: any[] = [];
  exportWithCTC = false;
  confirmationType =
  [     
    { type: "Probationary Confirmation" },
    { type: "Trainee Confirmation" },
    { type: "Probationary Retention" },
    { type: "Probation Extension" },
    { type: "Trainee Extension" },
  ];

  statusList = [
    { type: "Initiated", color: "info" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "warning" },
    { type: "Pending for Approval", color: "warning" },    
    { type: "Confirmation Rejected", color: "danger" },
    { type: "Pending for Extension Approval", color: "warning" },
    { type: "Extension Approved", color: "success" },
    { type: "Extension Rejected", color: "danger" },
    { type: "Email Sent", color: "success" },
    { type: "Withdrawn", color: "danger" },
  ];
  
  empStatusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Service Withdrawn", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ];
  initiatorTypeList = [
    { type: "HOD" },
    { type: "Reporting Manager and HOD" },
    { type: "Predefined Initiators" },

  ]
  appraisalType = [{ type: "Regular" }, { type: "Ad-Hoc" }, { type: "Retention" }, { type: "VP and Above" }];
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.confirmationType = "";
    this.filterModel.inProgress = true;
    this.filterModel.submittedBy="";
    this.filterModel.initiatorType=""
    this.filterModel.employeeConfirmationId=""
    this.filterModel.pendingWith=""
    this.filterModel.employeeStatus = "";

    
    this.exportWithCTC = this.util.hasPermission(PERMISSIONS.HR_CONFIRMATION_LIST_EXPORT_WITH_CTC);

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("ConfirmationList");
    if (oldFilter) {
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }

    this.filterModel.employeeId = this.currentUser.uid;
    this.getAllDropDownValues();
    this.getData();

  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  editConfirmation(employeeConfirmationId: any) {
    //let route = 'HR/confirmation/edit-confirmation/' + employeeConfirmationId;
    let route = 'HR/confirmation/confirmation-detail/' + employeeConfirmationId;
    this.router.navigate([route]);
  }

  getEmployeeList() {

    // if (this.from_date != null)
    //   this.filterModel.fromdate = this.getDateFormate(this.from_date);
    // if (this.to_date != null)
    //   this.filterModel.todate = this.getDateFormate(this.to_date);
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getAllDropDownValues() {

    this.getDepartments();
    this.getState();
    this.getLocation();
    this.getPlantList();
    this.getEmployeeCategoryList();
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantlist = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantlist = [];
    });
  }

  getPayGroupList() {
    
    if (this.filterModel.plantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else {
      this.payGroupList = [];
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
    }
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.employeeCategoryList = [];
      });
  }

  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch(error => {
      this.stateList = [];
    });
  }

  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.locationList = [];
    });
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find(x => x.type == item.status).color;
        
        var empStatusData = this.empStatusList.find(x => x.type == item.employeeStatus);
        if (empStatusData)
          item.employeeStatusColor = empStatusData.color;
      }
      // store the filter model
      this.dataStore.SetData("ConfirmationList", this.filterModel);
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  onStateChange() {
    var selectedState = this.stateList.find(x => x.id == this.filterModel.stateId);
    if (selectedState)
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
  }


  exportDataWithoutCTC() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probation Period": item.probationPeriod,
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Submitted By": item.submitedByName,
          "Submitted On": this.setDateFormate(item.createdDate),
          "Comments": item.comments,
          "HOD": item.hodName,
          "Type": item.confirmationType,
          "Confirmation Date": this.setDateFormate(item.confirmationDate),
          "Rating": item.rating,
          //"Achievements": item.hodSpecialAchievement,
          //"Next Confirmation Date": this.setDateFormate(item.newConfirmationDate),
          //"Reason": item.extensionReason,
          "Plant Name": item.plantName,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
          "Initiator Type":item.initiatorType
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Confirmation_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  exportDataWithCTC() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probation Period": item.probationPeriod,
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Submitted By": item.submitedByName,
          "Submitted On": this.setDateFormate(item.createdDate),
          "Comments": item.comments,
          "HOD": item.hodName,
          "Type": item.confirmationType,
          "Confirmation Date": this.setDateFormate(item.confirmationDate),
          "Rating": item.rating,
          "Current CTC": item.currentCTC,
          "New CTC": item.newCTC,
          "Increment Amount": item.incrementAmount,
          "One-time Amount": item.oneTimeSalaryAmount,
          //"Achievements": item.hodSpecialAchievement,
          //"Next Confirmation Date": this.setDateFormate(item.newConfirmationDate),
          //"Reason": item.extensionReason,
          "Plant Name": item.plantName,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
          "Initiator Type":item.initiatorType
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Confirmation_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  toggleColumns() {
    $(".columnGroup").on("click", function () {
      var group = $(this).attr("data-group");
      if (group == "all") {
        $(".columnGroup").removeClass('active').addClass('active');
        $("#data th, #data td").show();
      }
      else {
        $(this).toggleClass('active');
        $("#data ." + group).toggle();
      }
    });
  }
  initiateFinalConfirmation(employeeId: any, id: any) {
    let route = 'HR/confirmation/confirmation-detail/' + employeeId + "/" + id;
    this.router.navigate([route]);
  }


  viewConfirmationLetters(id: any) {
    let route = 'HR/confirmation/confirmation-print/' + id;
    this.router.navigate([route]);
  }

  view(id) {
    let route = 'HR/confirmation/view/' + id;
    this.router.navigate([route]);
  }


  selectAll = false;
  SelectAll() {
    for (var t of this.filterData.list) {      
        t.selected = this.selectAll;
    }
  }

  errorCount = 0;
  approvalSubmitBulk() {
    var selectedList = this.filterData.list.filter(x => x.selected && x.isBulkUpload == "Yes" && x.status == "Initiated");
    if (selectedList.length <= 0) {
      toastr.error("Please select at least one Initiated record to submit for approval.");
      return;
    }
    this.errorCount = 0;
    toastr.info("Submitting...");
    for (var t of selectedList) {
      var request: any = {};
      request.employeeConfirmationId = t.employeeConfirmationId;
      request.submittedById = this.currentUser.uid;

      this.httpService.HRpost(APIURLS.CONFIRMATION_FINAL_SUBMIT_FOR_APPROVAL, request).then((data: any) => {
        if (data) {
          if (!data.success) {
            this.errorCount++;
          }
          else {
            toastr.info("Approval Request submitted successfully");
          }
        }
      }).catch(error => {
        this.errorCount++;
      });
    }
    setTimeout(() => { this.getData(); }, 3000);
  }

  exportRecommendation() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_RECOMMENDATION_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "SNo": index,
          "Status": item.status,
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probation Period": item.probationPeriod,
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Submitted By": item.submitedByName,
          "Submitted On": this.setDateFormate(item.createdDate),
          "Comments": item.comments,
          "HOD": item.hodName,
          "Type": item.confirmationType,
          "Confirmation Date": this.setDateFormate(item.confirmationDate),
          "Rating": item.rating,
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
          "Initiator Type":item.initiatorType,
          
          "Initiator Recommendation Id": item.initiatorRecommendationDetailId,
          "Approver Name":item.approverEmployeeName,
          "Approver Type":item.approverType,
          "Special Achievement":item.recommendedSpecialAchievement,
          "Recommended Designation":item.recommendedDesignationName,
          "Recommended Role":item.recommendedRoleName,
          "Salary Type":item.recommendedSalaryType,
          "Salary Amount":item.recommendedSalaryAmount,
          "OneTime Salary Type":item.recommendedOneTimeSalaryType,
          "OneTime Salary Amount":item.recommendedOneTimeSalaryAmount,
          "Is Promotion Recommended":item.recommendedIsPromotionRecommended,
          "Promotion Comment":item.recommendedPromotionComment,
          "Additional Notes":item.recommendedAdditionalNotes,
          "IsApproved":item.isApproved,
          "Recommended Rating":item.recommendedRating,
          "Created Date":item.recommendedCreatedDate,
          "Sales":item.sales,
          "Growth":item.growth,
          "Confirmation Type":item.recommendedConfirmationType,
          "New Confirmation Date":item.recommendedNewConfirmationDate,
          "Extension Reason":item.recommendedExtensionReason,
          "Extension Reason Text":item.recommendedExtensionReasonText
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Confirmation_Recommendation_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }
}

