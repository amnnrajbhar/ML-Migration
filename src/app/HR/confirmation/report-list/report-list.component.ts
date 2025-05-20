import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';
import { HttpClient } from '@angular/common/http';
import { Util } from '../../Services/util.service';
import { PERMISSIONS } from '../../../shared/permissions';
declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.css'],
  providers: [Util]
})
export class ReportListComponent implements OnInit {

  constructor(private masterService: MasterDataService, private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService, private http: HttpClient, private util: Util) 
    { pdfMake.vfs = pdfFonts.pdfMake.vfs;}

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
  reportingGroupsList:any[] = [];
  earningHeads: any[] = [];
  deductionHeads: any[] = [];
  reimbursementHeads: any[] = [];
  benefitHeads: any[] = [];
  exportWithCTC = false;
  confirmationStatusList = [{ type: "Confirmed" }, { type: "Due For Confirmation" }];
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
    { type: "Confirmation Approved", color: "success" },
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
    this.filterModel.name = "";
    this.filterModel.confirmationType = "";
    this.filterModel.JoiningDateFrom = "";
    this.filterModel.JoiningDateTo = "";
    this.filterModel.ConfirmationDueFrom = "";
    this.filterModel.ConfirmationDueTo = "";
    this.filterModel.ReportingGroupId = "";
    this.filterModel.ConfirmationStatus = "Confirmed";
    this.filterModel.submittedBy='';
    this.filterModel.initiatorType='';
    this.filterModel.employeeConfirmationId='';
    this.filterModel.employeeStatus = "";
    //this.filterModel.approved = true;

    this.masterService.getPlantListAssigned(this.currentUser.uid).then((data:any)=>{this.plantList = data;});
    this.masterService.getDepartments().then((data:any)=>{this.departmentList = data;});
    this.masterService.getSubDepartments().then((data:any)=>{this.subDepartmentFullList = data;});
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.masterService.getDesignation().then((data:any)=>{this.designationList = data;});
    this.masterService.getRole().then((data:any)=>{this.roleList = data;});
    this.masterService.getReportingGroups().then((data:any)=>{this.reportingGroupsList = data;});  
    this.masterService.getEmployeeCategoryListAssigned(this.currentUser.uid, 0, 0)
    .then((data:any)=>{this.employeeCategoryList = data;});

    
    this.exportWithCTC = this.util.hasPermission(PERMISSIONS.HR_CONFIRMATION_LIST_EXPORT_WITH_CTC);

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("ConfirmationListReport");
    if (oldFilter) {
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
      this.getPayGroupList();      
      this.getSubDepartmentList();
      this.getLocationList();
    }

    this.filterModel.employeeId = this.currentUser.uid;
    this.getData();
  }
  
  ngAfterViewInit() {
    this.toggleColumns();
  }

  getPayGroupList(){
    this.payGroupList = [];
    this.filterModel.PayGroupId = "";
    this.masterService.getPayGroupListAssigned(this.currentUser.uid, this.filterModel.PlantId)
    .then((data:any)=>{this.payGroupList = data;});
  }

  getSubDepartmentList(){
    this.filterModel.SubDepartmentId = "";
    if(this.filterModel.DepartmentId > 0)
      this.subDepartmentList = this.subDepartmentFullList.filter(x=>x.departmentId == this.filterModel.DepartmentId);
    else 
      this.subDepartmentList = [];    
  }
  
  getLocationList(){
    this.filterModel.LocationId = "";
    if(this.filterModel.StateId > 0)
    {
    var selectedState = this.stateList.find(x => x.id == this.filterModel.StateId);
      this.locationList = this.locationFullList.filter(x=>x.stateId == selectedState.bland);
      }
    else 
      this.locationList = [];    
  }

  getConfirmationList() {
    
    this.filterModel.pageNo = 1;
    this.getData();    
  }

  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }

  getData(){
    this.isLoading = true;  
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        
        var statusData = this.statusList.find(x=>x.type == item.status);
        if(statusData)
          item.statusColor = statusData.color;

        var empStatusData = this.empStatusList.find(x => x.type == item.employeeStatus);
        if (empStatusData)
          item.employeeStatusColor = empStatusData.color;
          
        // store the filter model
        this.dataStore.SetData("ConfirmationListReport", this.filterModel);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
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

  
  request: any = {};
  sendEmail() {
    var selectedList = this.filterData.list.filter(x => x.selected && (x.status == "Extension Approved" || x.status == "Confirmation Approved" || x.status == "Email Sent"));
    if (selectedList.length <= 0) {
      swal("Please select at least one Approved record to send letter.");
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
    this.selectedList = this.filterData.list.filter(x => x.selected && (x.status == "Extension Approved" || x.status == "Confirmation Approved" || x.status == "Email Sent"));
    this.errorCount = 0;
    if (confirm("Are you sure you want to send bulk confirmation letter email?")) {
      this.sending = true;
      this.errorCount = 0;
      this.index = 0;
      this.sendLetterEmail();
    }
  }

  sendLetterEmail() {

    if (this.index >= this.selectedList.length) {
      swal("Successfully emailed the Confirmation letters.");
      $("#EmailModal").modal("hide");
      this.sending = false;
      if (this.errorCount > 0)
        swal("Error occurred while generating the letter for " + this.errorCount + " employees.");
    } else {
      var t = this.selectedList[this.index];
      swal("Generating letter for " + t.firstName);
      // get letter content
      this.httpService.HRgetById(APIURLS.CONFIRMATION_GET_LETTER_FOR_PRINT, t.employeeConfirmationId)
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
                          this.createPdfAndSendEmail(letterDetails.content, letterDetails.salaryChanged, t.employeeConfirmationId, t.firstName);
                        }
                      });
                  }
                  else {
                    //send email
                    this.createPdfAndSendEmail(letterDetails.content, letterDetails.salaryChanged, t.employeeConfirmationId, t.firstName);
                  }
                }
              });
          } else {
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

  createPdfAndSendEmail(pdfContent, salaryChanged, employeeConfirmationId, name) {
    this.request.employeeConfirmationId = employeeConfirmationId;
    this.request.submittedById = this.currentUser.uid;
    this.request.submittedByName = this.currentUser.fullName;

    this.createPDF(pdfContent, salaryChanged, false).getBase64((encodedString) => {
      if (encodedString) {
        this.request.attachment = encodedString;
        swal("Sending email for " + name);
        this.httpService.HRpost(APIURLS.CONFIRMATION_SEND_LETTER_EMAIL, this.request).then((data: any) => {
          if (data == 200 || data.success) {
            swal("Successfully emailed the Confirmation letter for " + name);
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

  createPDF(html, salaryChanged, forPrinting) {
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
        title: 'Confirmation Letter',
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
        "html-p": {
          unbreakable: true,
          margin: [0, 5, 0, 5],
          alignment: 'justify'
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
              text: salaryChanged == true ? footNote : "",
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

  selectedList: any[] = [];
  BulkPrint() {
    this.selectedList = this.filterData.list.filter(x => x.selected && (x.status == "Extension Approved" || x.status == "Confirmation Approved" || x.status == "Email Sent"));
    if (this.selectedList.length <= 0) {
      swal("Please select at least one confirmation record to print letters.");
      return;
    }
    this.getbase64image();
    if (confirm("Are you sure you want to print bulk confirmation letters?")) {
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
      this.createPDF(this.letterContent, true, true).print();
      swal("Opening letters for printing...");
      if (this.errorCount > 0)
        swal("Error occurred while generating the letter for " + this.errorCount + " employees.");
    } else {
      var t = this.selectedList[this.index];
      swal("Generating letter for " + t.firstName);

      // get letter content
      this.httpService.HRgetById(APIURLS.CONFIRMATION_GET_LETTER_FOR_PRINT, t.employeeConfirmationId)
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
          this.sending = false;
        }).catch(error => {
          this.index++;
          this.getLetterContentForPrinting();
          this.errorCount++;
        });
    }
  }
  
  
  exportCTCData() {
    this.filterModel.export = true;
    this.isLoading = true;
    console.log('Inside 1');
    this.earningHeads = [];
    this.deductionHeads = [];
    this.reimbursementHeads = [];
    this.benefitHeads = [];
    this.httpService.HRpost(APIURLS.CONFIRMATION_EXPORT_CTC_DATA, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      for (var item of data) {
        for (var details of item.salaryHeads) {
          if (details.salaryType == "I") {
            console.log('Inside 01');
            if (!this.earningHeads.some(x => x.salaryHeadId == details.salaryHeadId)) {
              console.log('Inside 001');
              this.earningHeads.push(
                {
                  salaryHeadId: details.salaryHeadId,
                  salaryHeadName: details.salaryHeadName,
                  frequency: details.frequency,
                  salaryType: details.salaryType,
                  sequenceNo: details.sequenceNo
                });
            }
          }
          else if (details.salaryType == "D") {
            console.log('Inside 02');
            if (!this.deductionHeads.some(x => x.salaryHeadId == details.salaryHeadId)) {
              console.log('Inside 002');
              this.deductionHeads.push(
                {
                  salaryHeadId: details.salaryHeadId,
                  salaryHeadName: details.salaryHeadName,
                  frequency: details.frequency,
                  salaryType: details.salaryType,
                  sequenceNo: details.sequenceNo
                });
            }
          }
          else if (details.salaryType == "R") {
            console.log('Inside 03');
            if (!this.reimbursementHeads.some(x => x.salaryHeadId == details.salaryHeadId)) {
              console.log('Inside 003');
              this.reimbursementHeads.push(
                {
                  salaryHeadId: details.salaryHeadId,
                  salaryHeadName: details.salaryHeadName,
                  frequency: details.frequency,
                  salaryType: details.salaryType,
                  sequenceNo: details.sequenceNo
                });
            }
          }
          else if (details.salaryType == "B") {
            console.log('Inside 04');
            if (!this.benefitHeads.some(x => x.salaryHeadId == details.salaryHeadId)) {
              console.log('Inside 004');
              this.benefitHeads.push(
                {
                  salaryHeadId: details.salaryHeadId,
                  salaryHeadName: details.salaryHeadName,
                  frequency: details.frequency,
                  salaryType: details.salaryType,
                  sequenceNo: details.sequenceNo
                });
            }
          }
        }
      }
      console.log('Inside 2');
      var exportList = [];
      let index = 0;
      data.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Employee No": item.employeeNo,
          "Name": item.employeeName,
          "Status": item.status,
          "Confirmation Type": item.confirmationType,
          "Confirmation Date": item.confirmationDate,
          "Performance Rating": item.rating,
          "Old CTC": item.oldCTC,
          "New CTC": item.newCTC,
          "BreakUp": item.breakUpType,
        };
        var earningsTotal = 0;
        var deductionsTotal = 0;
        var reimbursementsTotal = 0;
        var benefitsTotal = 0;
        for (var head of this.earningHeads) {
          if (item.salaryHeads.some(x => x.salaryHeadId == head.salaryHeadId)) {
            exportItem[head.salaryHeadName] = item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
            earningsTotal += item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
          }
          else
            exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Earnings"] = earningsTotal;
        for (var head of this.deductionHeads) {
          if (item.salaryHeads.some(x => x.salaryHeadId == head.salaryHeadId)) {
            exportItem[head.salaryHeadName] = item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
            deductionsTotal += item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
          }
          else
            exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Deductions"] = deductionsTotal;
        for (var head of this.reimbursementHeads) {
          if (item.salaryHeads.some(x => x.salaryHeadId == head.salaryHeadId)) {
            exportItem[head.salaryHeadName] = item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
            reimbursementsTotal += item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
          }
          else
            exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Reimbursements"] = reimbursementsTotal;
        for (var head of this.benefitHeads) {
          if (item.salaryHeads.some(x => x.salaryHeadId == head.salaryHeadId)) {
            exportItem[head.salaryHeadName] = item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
            benefitsTotal += item.salaryHeads.find(x => x.salaryHeadId == head.salaryHeadId).annualAmount;
          }
          else
            exportItem[head.salaryHeadName] = "";
        }
        exportItem["Total Annual Benefits"] = benefitsTotal;
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Confirmation_CTC_Report');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  exportDataWithoutCTC(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No": index,
          "Confirmation ID": item.employeeConfirmationId,
          "Status": item.status,
          "Letter Printed": item.printed == true ? "Yes" : "No",
          "Letter Emailed": item.emailed == true ? "Yes" : "No",
          "Letter Downloaded": item.downloaded == true ? "Yes" : "No",
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probationary Period": item.probationPeriod + "month(s)",
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
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
          "Sub-Department": item.subDepartmentName,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Group": item.reportingGroup,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
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
  
  exportDataWithCTC(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_CONFIRMATION_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No": index,
          "Confirmation ID": item.employeeConfirmationId,
          "Status": item.status,
          "Letter Printed": item.printed == true ? "Yes" : "No",
          "Letter Emailed": item.emailed == true ? "Yes" : "No",
          "Letter Downloaded": item.downloaded == true ? "Yes" : "No",
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probationary Period": item.probationPeriod + "month(s)",
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
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
          "Sub-Department": item.subDepartmentName,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Group": item.reportingGroup,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
          "CTC": item.currentCTC,
          "Monthly Gross": (item.currentCTC) / 12,

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
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  exportRecommendation(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.CONFIRMATION_GET_RECOMMENDATION_LIST_REPORT_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl No": index,
          "Confirmation ID": item.employeeConfirmationId,
          "Status": item.status,
          "Letter Printed": item.printed == true ? "Yes" : "No",
          "Letter Emailed": item.emailed == true ? "Yes" : "No",
          "Letter Downloaded": item.downloaded == true ? "Yes" : "No",
          "Employee No": item.employeeNo,
          "Joining Date": this.setDateFormate(item.dateOfJoining),
          "Probationary Period": item.probationPeriod + "month(s)",
          "Confirmation Due": this.setDateFormate(item.dateOfConfirmation),
          "Name": item.firstName +" "+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
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
          "Plant": item.plantName,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.state,
          "Location": item.location,
          "Department": item.department,
          "Sub-Department": item.subDepartmentName,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Reporting Group": item.reportingGroup,
          "Reporting Manager": item.reportingManagerName,
          "Employment Type": item.employmentType,
          "CTC": item.currentCTC,
          "Monthly Gross": (item.currentCTC) / 12,
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
      this.excelService.exportAsExcelFile(exportList, 'Recommendation_List_Report'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    }); 
  }
}
