import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
declare var $: any;
declare var toastr: any;
import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';
//import { HttpClient } from '@angular/common/http';
import { Util } from '../../Services/util.service';
import { PERMISSIONS } from '../../../shared/permissions';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.css'],
  providers: [Util]
})
export class ReportListComponent implements OnInit {

  constructor(private masterService: MasterDataService, private httpService: HttpService, private http: HttpClient,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService, private util: Util) {pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  currentUser: AuthData;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  stateList: any[] = [];
  locationFullList: any[] = [];
  locationList: any[] = [];
  departmentList: any[] = [];
  subDepartmentFullList: any[] = [];
  subDepartmentList: any[] = [];
  designationList: any[] = [];
  roleList: any[] = [];
  filterData: any = {};
  filterModel: any = {};
  isLoading: boolean = false;
  reportingGroupsList: any[] = [];
  filterText: any;
  exportWithCTC = false;

  statusList = [
    { type: "Pending for Approval", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
    { type: "Withdrawn", color: "warning" },
    { type: "Email Sent", color: "success" },

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
  appraisalTypeList = [{ type: "Regular" }, { type: "Ad-Hoc" }, { type: "Retention" }, { type: "VP and Above" }];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;

    // initialize the filter model
    this.filterModel.PlantId = "";
    this.filterModel.PayGroupId = "";
    this.filterModel.EmployeeCategoryId = "";
    this.filterModel.DepartmentId = "";
    this.filterModel.SubDepartmentId = "";
    this.filterModel.DesignationId = "";
    this.filterModel.RoleId = "";
    this.filterModel.StateId = "";
    this.filterModel.LocationId = "";

    this.filterModel.Status = "";
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";
    this.filterModel.AppraisalPeriodFrom = "";
    this.filterModel.AppraisalPeriodTo = "";
    this.filterModel.AppraisalType = "";
    this.filterModel.ReportingGroupId = "";    
    this.filterModel.employeeStatus = "";
    
    this.exportWithCTC = this.util.hasPermission(PERMISSIONS.HR_APPRAISAL_LIST_EXPORT_WITH_CTC);

    this.masterService.getPlantListAssigned(this.currentUser.uid).then((data: any) => { this.plantList = data; });
    this.masterService.getDepartments().then((data: any) => { this.departmentList = data; });
    this.masterService.getSubDepartments().then((data: any) => { this.subDepartmentFullList = data; });
    this.masterService.getState().then((data: any) => { this.stateList = data; });
    this.masterService.getLocation().then((data: any) => { this.locationFullList = data; });
    this.masterService.getDesignation().then((data: any) => { this.designationList = data; });
    this.masterService.getRole().then((data: any) => { this.roleList = data; });
    //this.masterService.getReportingGroups().then((data:any)=>{this.reportingGroupsList = data;});
    this.masterService.getEmployeeCategoryListAssigned(this.currentUser.uid, 0, 0)
      .then((data: any) => { this.employeeCategoryList = data; });
    this.getReportingGroups();
    //this.getLocation();
    this.filterText = "Employee";
    this.filterModel.groupBy = "Employee";

  }


  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.locationList = [];
    });
  }

  getReportingGroups() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_REPORTING_GROUPS).then((data: any) => {
      if (data.length > 0) {
        this.reportingGroupsList = data.sort((a, b) => { if (a.reportingGroupLt > b.reportingGroupLt) return 1; if (a.reportingGroupLt < b.reportingGroupLt) return -1; return 0; });
      }
      ;
    }).catch(error => {
      this.reportingGroupsList = [];
    });
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  getPayGroupList() {
    this.payGroupList = [];
    
    this.filterModel.PayGroupId = "";
    this.filterModel.EmployeeCategoryId = "";
    this.masterService.getPayGroupListAssigned(this.currentUser.uid, this.filterModel.PlantId)
      .then((data: any) => { this.payGroupList = data; });
  }

  getSubDepartmentList() {
    this.filterModel.SubDepartmentId = "";
    if (this.filterModel.DepartmentId > 0)
      this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.DepartmentId);
    else
      this.subDepartmentList = [];
  }

  getLocationList() {
    this.filterModel.LocationId = "";
    if (this.filterModel.StateId > 0) {
      var selectedState = this.stateList.find(x => x.id == this.filterModel.StateId);
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
    }
    else
      this.locationList = [];
  }

  getAppraisalList() {

    this.filterModel.pageNo = 1;
    this.getData();
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

  getData() {
    this.filterText = this.filterModel.groupBy;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_APPRAISAL_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find(x => x.type == item.status).color;
        var empStatusData = this.empStatusList.find(x => x.type == item.employeeStatus);
        if (empStatusData)
          item.empStatusColor = empStatusData.color;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
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


  exportDataWithCTC() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_APPRAISAL_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem: any = {};
        if (this.filterText == 'Employee') {
          exportItem = {
            "Sl No": index,
            "Appraisal ID": item.employeeInitialAppraisalDetailId,
            "Employee No": item.employeeNo,
            "Status": item.status,
            "Name": item.name,
            "Designation": item.designation,
            "Role": item.role,
            "Department": item.department,
            "Sub-Department": item.subDepartment,
            "Reporting Group": item.reportingGroup,
            "Plant Name": item.plant,
            "Plant Code": item.plantCode,
            "Pay Group": item.payGroup,
            "Employee Category": item.employeeCategory,
            "Reporting Manager": item.reportingManager,
            "HOD": item.hod,
            "Date of Joining": this.setDateFormate(item.dateOfJoining),
            "Location": item.location,
            "State": item.state,
            "Appraisal Type": item.appraisalType,
            "Appraisal Date": this.setDateFormate(item.appraisalDate),
            "Effective Month": this.setDateFormate(item.appraisalDate),
         
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'Plant') {
          exportItem = {
            "Plant": item.plant,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'PayGroup') {
          exportItem = {
            "Pay Group": item.payGroup,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'Department') {
          exportItem = {
            "Department": item.department,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'State') {
          exportItem = {
            "State": item.state,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  exportDataWithoutCTC() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_APPRAISAL_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem: any = {};
        if (this.filterText == 'Employee') {
          exportItem = {
            "Sl No": index,            
            "Appraisal ID": item.employeeInitialAppraisalDetailId,
            "Employee No": item.employeeNo,
            "Status": item.status,
            "Name": item.name,
            "Designation": item.designation,
            "Role": item.role,
            "Department": item.department,
            "Sub-Department": item.subDepartment,
            "Reporting Group": item.reportingGroup,
            "Plant Name": item.plant,
            "Plant Code": item.plantCode,
            "Pay Group": item.payGroup,
            "Employee Category": item.employeeCategory,
            "Reporting Manager": item.reportingManager,
            "HOD": item.hod,
            "Date of Joining": this.setDateFormate(item.dateOfJoining),
            "Location": item.location,
            "State": item.state,
            "Appraisal Type": item.appraisalType,
            "Appraisal Date": this.setDateFormate(item.appraisalDate),
            "Effective Month": this.setDateFormate(item.appraisalDate),
          };
        }
        else if (this.filterText == 'Plant') {
          exportItem = {
            "Plant": item.plant,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'PayGroup') {
          exportItem = {
            "Pay Group": item.payGroup,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'Department') {
          exportItem = {
            "Department": item.department,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'State') {
          exportItem = {
            "State": item.state,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  setDateFormate(date: any): string {
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
 
  exportRecommendation() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_APPRAISAL_RECOMMENDATION_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem: any = {};
        if (this.filterText == 'Employee') {
          exportItem = {
            "Sl No": index,            
            "Appraisal ID": item.employeeInitialAppraisalDetailId,
            "Employee No": item.employeeNo,
            "Status": item.status,
            "Name": item.name,
            "Designation": item.designation,
            "Role": item.role,
            "Department": item.department,
            "Sub-Department": item.subDepartment,
            "Reporting Group": item.reportingGroup,
            "Plant": item.plant,
            "Pay Group": item.payGroup,
            "Employee Category": item.employeeCategory,
            "Reporting Manager": item.reportingManager,
            "HOD": item.hod,
            "Date of Joining": this.setDateFormate(item.dateOfJoining),
            "Location": item.location,
            "State": item.state,
            "Appraisal Type": item.appraisalType,
            "Appraisal Date": this.setDateFormate(item.appraisalDate),
            "Effective Month": this.setDateFormate(item.appraisalDate),
         
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
            
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
        }
        else if (this.filterText == 'Plant') {
          exportItem = {
            "Plant": item.plant,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'PayGroup') {
          exportItem = {
            "Pay Group": item.payGroup,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'Department') {
          exportItem = {
            "Department": item.department,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        else if (this.filterText == 'State') {
          exportItem = {
            "State": item.state,
            "Old CTC": item.oldCTC,
            "Old Monthly Gross": item.oldMonthlyGross,
            "Monthly Increment": item.monthlyIncrement,
            "Yearly Increment": item.yearlyIncrement,
            "Increment %": item.incrementPercent,
            "New CTC": item.newCTC,
            "New Monthly Gross": item.newMonthlyGross,
          };
        }
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_Recommendation_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  selectedList: any[] = [];
  BulkPrint() {
    this.selectedList = this.filterData.list.filter(x => x.selected);
    if (this.selectedList.length <= 0) {
      swal("Please select at least one appraisal record to print letters.");
      return;
    }
    this.getbase64image();
    if (confirm("Are you sure you want to print bulk appraisal letters?")) {
      this.errorCount = 0;
      this.index = 0;
      this.letterContent = "";
      this.firstPage = true;
      this.getLetterContentForPrinting();
    }
  }

  index = 0;
  letterContent = "";
  firstPage = true;
  getLetterContentForPrinting() {

    if (this.index >= this.selectedList.length) {
      this.createPDF(this.letterContent, true).print();
      swal("Opening letters for printing...");
      if (this.errorCount > 0)
        swal("Error occurred while generating the letter for " + this.errorCount + " employees.");
    } else {
      var t = this.selectedList[this.index];
      swal("Generating letter for " + t.name);

      // get letter content
      this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_LETTER_FOR_PRINT, t.employeeInitialAppraisalDetailId)
        .then((data: any) => {
          if (data) {
            var letterDetails = data;

            // remove signature image tab
            letterDetails.content = letterDetails.content.replace('<img class="imgSign" src="{SIGNATORY_IMAGE}">', "<br/><br/><br/>");
            if (this.firstPage == true) {
              this.firstPage = false;
              this.letterContent += letterDetails.content;
            }
            else {
              this.letterContent += '<div class="newPage">&nbsp;</div>' + letterDetails.content;
            }
          }
          // get next letter content
          this.index++;
          this.getLetterContentForPrinting();
        }).catch(error => {
          this.index++;
          this.getLetterContentForPrinting();
          this.errorCount++;
        });
    }
  }

  request: any = {};
  sendEmail() {
    var selectedList = this.filterData.list.filter(x => x.selected && (x.status == "Approved" || x.status == "Email Sent"));
    if (selectedList.length <= 0) {
      swal("Please select at least one Approved Appraisal record to send letter.");
      return;
    }
    $("#EmailModal").modal("show");
  }

  sending = false;
  letterDetails: any = {};
  errorCount = 0;
  GenerateAndSendEmail() {
    if (this.request.emailType == "Custom" && this.request.EmailId == "") {
      toastr.error("Please enter comma separated email Ids.");
      return;
    }
    this.getbase64image();
    this.selectedList = this.filterData.list.filter(x => x.selected && (x.status == "Approved" || x.status == "Email Sent"));
    this.errorCount = 0;
    if (confirm("Are you sure you want to send bulk appraisal letter email?")) {
      this.sending = true;
      this.errorCount = 0;
      this.index = 0;
      this.sendLetterEmail();
    }
  }


  sendLetterEmail() {

    if (this.index >= this.selectedList.length) {
      swal("Successfully emailed the Appraisal letters.");
      $("#EmailModal").modal("hide");
      this.sending = false;
      if (this.errorCount > 0)
        swal("Error occurred while generating the letter for " + this.errorCount + " employees.");
    } else {
      var t = this.selectedList[this.index];
      swal("Generating letter for " + t.name);
      // get letter content
      this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_APPRAISAL_GET_LETTER_FOR_PRINT, t.employeeInitialAppraisalDetailId)
        .then((data: any) => {
          if (data) {
            var letterDetails = data;

            //get signatory image
            this.http.get('../../..' + letterDetails.imageUrl, { responseType: 'blob' })
              .subscribe(blob => {
                const reader = new FileReader();
                const binaryString = reader.readAsDataURL(blob);
                reader.onload = (event: any) => {
                  letterDetails.content = letterDetails.content.replace("{SIGNATORY_IMAGE}", event.target.result);

                  // get second signatory image
                  if (letterDetails.secondImageUrl != null && letterDetails.secondImageUrl != undefined) {
                    this.http.get('../../..' + letterDetails.secondImageUrl, { responseType: 'blob' })
                      .subscribe(blob => {
                        const reader = new FileReader();
                        const binaryString = reader.readAsDataURL(blob);
                        reader.onload = (event: any) => {
                          letterDetails.content = letterDetails.content.content.replace("{SECOND_SIGNATORY_IMAGE}", event.target.result);

                          //send email
                          this.createPdfAndSendEmail(letterDetails.content, t.employeeInitialAppraisalDetailId, t.name);
                        }
                      });
                  }
                  else {
                    //send email
                    this.createPdfAndSendEmail(letterDetails.content, t.employeeInitialAppraisalDetailId, t.name);
                  }
                }
              });
          }
          else {
            this.index++;
            this.sendLetterEmail();
          }
        }).catch(error => {
          this.index++;
          this.sendLetterEmail();
          this.errorCount++;
        });
    }
  }

  createPdfAndSendEmail(pdfContent, employeeInitialAppraisalDetailId, name) {
    this.createPDF(pdfContent, false).getBase64((encodedString) => {
      if (encodedString) {
        this.request.employeeInitialAppraisalDetailId = employeeInitialAppraisalDetailId;
        this.request.submittedById = this.currentUser.uid;
        this.request.submittedByName = this.currentUser.fullName;
        this.request.attachment = encodedString;
        swal("Sending email for " + name);
        this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_SEND_LETTER_EMAIL, this.request).then((data: any) => {
          if (data == 200 || data.success) {
            swal("Successfully emailed the Appraisal letter for " + name);
          } else if (!data.success) {
            swal(data.message); this.errorCount++;
          } else { swal("Error occurred."); this.errorCount++; }
          // send next letter email
          this.index++;
          this.sendLetterEmail();
        }
        ).catch(error => {
          this.index++;
          this.sendLetterEmail();
          swal(error);
          this.errorCount++;
        });
      } else {
        this.index++;
        this.sendLetterEmail();
      }
    });
  }

  image: string;
  getbase64image() {
    this.http.get('../../../assets/dist/img/micrologo.png', { responseType: 'blob' })
      .subscribe(blob => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          console.log('Image in Base64: ', event.target.result);
          this.image = event.target.result;
        };

      });
  }

  
  createPDF(html, forPrinting) {
    //var printContents = document.getElementById('pdfcontent').innerHTML;
    var OrganisationName = "MICRO LABS LIMITED";//+','+this.locationname;
    var address = "REGD. & CORPORATE OFFICE: # 31, RACE COURSE ROAD, BENGALURU 560 001, KARNATAKA, INDIA";
    var contactInfo = "Tel. : +91- 80-2237 0451- 57 Fax : +91-80-2237 0463 CIN: U24232KA1973PLC002d01 Website: www.microlabsltd.com Email : info@microlabs.in";
    var footNote = "Please note that your remuneration package is strictly Confidential between you and the Organization and any breach of this confidentiality on your part would be viewed seriously.";
    var logo = this.image;
    //var pdfContent = $('#pdfcontent').clone();
    var printContents = html; //$(pdfContent).html();
    if (forPrinting == true) {
      //$(html).find(".imgSign").replaceWith('<br/><br/><br/>');      
      //printContents = $(html).html();
    }

    var htmnikhitml = htmlToPdfmake(`<html>
  <head>
  </head>
  <body>
  ${printContents}
  <div>     
  </div>
  </body>  
  </html>`, {
      tableAutoSize: true,
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
      defaultStyles: {
        td: {
          border: undefined
        },
        img: undefined,
        p: undefined
      }
    });

    var docDefinition = {
      info: {
        title: 'Appraisal Letter',
      },
      content: [
        htmnikhitml,
      ],
      defaultStyle: {
        fontSize: 10,
        // fontStyle: 'normal',
        // font: 'Times',
        p: { margin: [10, 5, 10, 5], alignment: 'justify' },
        img: { margin: [0, 0, 0, 0] },
        b: { margin: [0, 0, 0, 0] },
        bold: false,
        table: {
          width: '*',
          margin: [10, 10, 10, 10],
          border: [true, true, true, true]
        },
        th: { bold: true, fillColor: '#8B0000' },
        td: {
          border: [true, true, true, true]
        }
      },
      stack: [{
        unbreakable: true,
      }],
      styles: {
        "pull-right": {
          textAlign: "right"
        },
        newPage: {
          pageBreak: 'before'
        },
        "html-img": {
          margin: [0, 0, 0, 0],
        },
        "html-table": {
          unbreakable: true
        },
        "html-td": {
          border: [true, true, true, true],
          margin: [0, 0, 0, 0],
        },
        "html-th": {
          border: [true, true, true, true],
          margin: [0, 0, 0, 0],
        },
        "html-p": {
          unbreakable: true,
          margin: [0, 5, 0, 5],
          alignment: 'justify'
        },
        "html-li": {
          margin: [0, 5, 0, 10],
          alignment: 'justify'
        },
        tableNoBorders: {
          border: [false, false, false, false],
          margin: [0, 0, 0, 0],
        }
      },
      pageBreak: "after",
      pageSize: 'A4',
      pageMargins: [40, 140, 40, 40],
      pageOrientation: 'portrait',
      header: function (currentPage, pageCount) {
        if (forPrinting == true) return { height: 120, text: "" };
        return {
          alignment: 'center',
          stack: [
            { image: logo, width: 80, height: 60 },
            { text: OrganisationName, bold: true, fontSize: 16 },
            { text: address, fontSize: 9 },
            { text: contactInfo, fontSize: 8 },
          ],
          width: '*',
          margin: [0, 20, 0, 0],
          height: 120
        }
      },
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              alignment: 'left',
              text: footNote,
              fontSize: 9,
              width: '90%'
            },
            {
              alignment: 'right',
              text: forPrinting == true ? "" : "Page " + currentPage + " of " + pageCount,
              fontSize: 10,
              width: '10%'
            }
          ],
          margin: [40, 5, 40, 5]
        }
      },
      pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        if (currentNode.style && currentNode.style.indexOf('newPage') > -1)
          return true;
        else if (currentNode.style && currentNode.style.indexOf('lastNode') > -1 && followingNodesOnPage.length < 10)
          return true;
        else 
          return false;
      }
    };

    return pdfMake.createPdf(docDefinition);
  }

  selectAll = false;
  SelectAll() {
    for (var t of this.filterData.list) {      
        t.selected = this.selectAll;
    }
  }
  viewAppraisalDetails(eid: any, id: any) {
    let route = 'HR/actions/appraisal-view-only/' + eid + "/" + id;
    this.router.navigate([route]);
  }

  viewAppraisalLetters(id: any) {
    let route = 'HR/actions/appraisal-print/' + id;
    this.router.navigate([route]);
  }
}

