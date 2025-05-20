import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { HttpClient } from '@angular/common/http';

import * as pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from 'html-to-pdfmake';
import { Util } from '../../Services/util.service';
import { PERMISSIONS } from '../../../shared/permissions';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-appraisal-initialreviewlist',
  templateUrl: './appraisal-initialreviewlist.component.html',
  styleUrls: ['./appraisal-initialreviewlist.component.css'],
  providers: [Util]
})
export class AppraisalInitialreviewlistComponent implements OnInit {
  
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private http: HttpClient,
    private dataStore: DataStorageService, private excelService: ExcelService, private util: Util) { pdfMake.vfs = pdfFonts.pdfMake.vfs; }

  currentUser: AuthData;
  isLoading: boolean = false;
  action: string;
  employeeId: number;
  comment: string;
  filterData: any = {};
  filterModel: any = {};
  plantList: any[] = [];
  payGroupList: any[] = [];
  empCategoryList: any[] = [];
  selectedPlant: any = "";
  selectedPayGroup: any = "";
  selectedEmpCategory: any = "";
  earningHeads: any[] = [];
  deductionHeads: any[] = [];
  reimbursementHeads: any[] = [];
  benefitHeads: any[] = [];
  exportWithCTC = false;
  statusList = [
    { type: "Appraisal Initiated", color: "info" },
    { type: "Pending For Recommendation", color: "warning" },
    { type: "Recommendation Submitted", color: "info" },
    { type: "Pending for Approval", color: "warning" },
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
    { type: "Withdrawn", color: "danger" },
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
  initiatorTypeList = [
    { type: "HOD" },
    { type: "Hr" },
    { type: "Reporting Manager and HOD" },
    { type: "Predefined Initiators" },

  ]
  appraisalTypeList = [
    { type: "Regular" },
    { type: "Ad-Hoc" },
    { type: "Retention" }, 
    { type: "VP and Above" }
  ]
  isBulkUploadList = [
    { type: "Yes" },
    { type: "No" },
  ]
  appraisalPeriod: any;
  appraisalPeriodDates = [{ type: "2023-24" }, { type: "2024-25" }, { type: "2025-26" }, { type: "2026-27" }, { type: "2027-28" }];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.name = "";
    this.filterModel.employeeNo = "";
    this.filterModel.departmentId = "";
    this.filterModel.subDepartmentId = "";
    this.filterModel.designationId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.initiatorType = "";
    this.filterModel.status = "";
    this.filterModel.appraisalType = "";
    this.filterModel.appraisalPeriod = "";
    this.filterModel.isBulkUpload = "";
    this.filterModel.submittedBy='';
    this.filterModel.employeeStatus = "";

    this.exportWithCTC = this.util.hasPermission(PERMISSIONS.HR_APPRAISAL_LIST_EXPORT_WITH_CTC);
    
    this.LoadDropDowns();

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("AppraisalReviewList");
    if (oldFilter) {
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
      this.filterModel.employeeId = this.currentUser.uid;
      this.getData();
    }
    //this.getData();
  }

  ngAfterViewInit() {
    this.toggleColumns();
  }

  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.empCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch(error => {
        this.empCategoryList = [];
      });
  }

  getPayGroupList() {
    this.filterModel.payGroupId = "";
    if (this.filterModel.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  designationList: any[] = [];
  getDesignation() {
    this.httpService.HRget(APIURLS.BR_DESIGNATION_HR_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.designationList = [];
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

  subDepartmentFullList: any[] = [];
  subDepartmentList: any[] = [];
  getSubDepartments() {
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a, b) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
    }).catch(error => {
      this.subDepartmentFullList = [];
    });
  }

  onDepartmentChange() {
    this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.departmentId);
  }

  onStateChange() {
    this.locationList = this.locationFullList.filter(x => x.stateId == this.filterModel.stateId);
  }

  selectAll = false;
  SelectAll() {
    for (var t of this.filterData.list) {      
        t.selected = this.selectAll;
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

  getList() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_EMPLOYEE_INITIAL_APPRAISAL_REVIEW_LIST, this.filterModel)
      // + "?plantId=" + (this.selectedPlant ? this.selectedPlant : "")
      // + "&payGroupId=" + (this.selectedPayGroup ? this.selectedPayGroup : "")
      // + "&empCategoryId=" + (this.selectedEmpCategory ? this.selectedEmpCategory : "")
      .then((data: any) => {
        this.filterData = data;
        for (var item of this.filterData.list) {
          if (this.statusList.find(x => x.type == item.status) != null)
            item.statusColor = this.statusList.find(x => x.type == item.status).color;
            
            var empStatusData = this.empStatusList.find(x => x.type == item.employeeStatus);
            if (empStatusData)
              item.empStatusColor = empStatusData.color;
        }
        // store the filter model
        this.dataStore.SetData("AppraisalReviewList", this.filterModel);
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
      });
  }

  LoadDropDowns() {
    this.getDepartments();
    this.getDesignation();
    this.getState();
    this.getLocation();
    this.getPlantList();
    this.getPayGroupList();
    this.getDesignation();
    this.getSubDepartments();
    this.getEmployeeCategoryList();
  }



  initiateFinalAppraisal(employeeId: any, id: any) {
    let route = 'HR/actions/appraisal/' + employeeId + "/" + id;
    this.router.navigate([route]);
  }

  exportDataWithCTC() {

    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_EMPLOYEE_INITIAL_APPRAISAL_REVIEW_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;

      var exportList = [];
      let index = 0;
      data.list.forEach(item => {

        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Appraisal ID": item.employeeInitialAppraisalDetailId,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "IsBukUpload": item.isBulkUpload,
          "Initiation By": item.initiatedBy,
          "Initiation Date": this.setDateFormate(item.initiatedDate),
          "Employee No": item.employeeNo,
          "Name": item.name,
          "Plant Name": item.plant,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroup,
          "Employee Category": item.employeeCategory,
          "Location": item.location,
          "Department": item.departmentName,
          "Designation": item.oldDesignation,
          "Role": item.oldRole,
          "Rating": item.rating,
          "Current Ctc": item.currentCTC,
          "New Ctc": item.newCTC,
          "Increment Amount": item.incrementAmount,

          // "Salary Type": item.salaryType,
          // "Recommended Salary": item.recommendedSalary,
          // "Is Promotion Recommended": item.isPromotionRecommended,
          // "Promotion Comment": item.promotionComment,
          // "Recommended Designation": item.recommendedDesignation,
          // "Recommended Role": item.recommendedRole,
          // "Special Achievement": item.specialAchievement,


          "Appraisal Type": item.appraisalType,
          "Initiator Type": item.appraisalInitiatorType,
          "Comment": item.comment,
        };

        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_Review_List');
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
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_EMPLOYEE_INITIAL_APPRAISAL_REVIEW_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;

      var exportList = [];
      let index = 0;
      data.list.forEach(item => {

        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Appraisal ID": item.employeeInitialAppraisalDetailId,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "IsBukUpload": item.isBulkUpload,
          "Initiation By": item.initiatedBy,
          "Initiation Date": this.setDateFormate(item.initiatedDate),
          "Employee No": item.employeeNo,
          "Name": item.name,
          "Plant Name": item.plant,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroup,
          "Employee Category": item.employeeCategory,
          "Location": item.location,
          "Department": item.departmentName,
          "Designation": item.oldDesignation,
          "Role": item.oldRole,
          "Rating": item.rating,
        
          // "Salary Type": item.salaryType,
          // "Recommended Salary": item.recommendedSalary,
          // "Is Promotion Recommended": item.isPromotionRecommended,
          // "Promotion Comment": item.promotionComment,
          // "Recommended Designation": item.recommendedDesignation,
          // "Recommended Role": item.recommendedRole,
          // "Special Achievement": item.specialAchievement,


          "Appraisal Type": item.appraisalType,
          "Initiator Type": item.appraisalInitiatorType,
          "Comment": item.comment,
        };

        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_Review_List');
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
  viewAppraisalDetails(eid: any, id: any) {
    let route = 'HR/actions/appraisal-view-only/' + eid + "/" + id;
    this.router.navigate([route]);
  }

  viewAppraisalLetters(id: any) {
    let route = 'HR/actions/appraisal-print/' + id;
    this.router.navigate([route]);
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

  approvalSubmitBulk() {
    var selectedList = this.filterData.list.filter(x => x.selected && x.isBulkUpload == "Yes" && x.status == "Appraisal Initiated");
    if (selectedList.length <= 0) {
      toastr.error("Please select at least one Appraisal Initiated record to submit for approval.");
      return;
    }
    this.errorCount = 0;
    toastr.info("Submitting...");
    for (var t of selectedList) {
      var request: any = {};
      request.employeeInitialAppraisalDetailId = t.employeeInitialAppraisalDetailId;
      request.submittedById = this.currentUser.uid;

      this.httpService.HRpost(APIURLS.HR_APPRAISAL_DETAILS_SUBMIT_FOR_APPROVAL, request).then((data: any) => {
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


  exportCTCData() {
    this.filterModel.export = true;
    this.isLoading = true;
    console.log('Inside 1');
    this.earningHeads = [];
    this.deductionHeads = [];
    this.reimbursementHeads = [];
    this.benefitHeads = [];
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_APPRAISAL_EXPORT_CTC_DATA, this.filterModel).then((data: any) => {
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
          "Appraisal Cycle": item.appraisalCycle,
          "Performance Rating": item.performanceRating,
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
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_CTC_Report');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }
  exportRecommendation() {

    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_GET_EMPLOYEE_INITIAL_APPRAISAL_REVIEW_RECOMMENDATION_LIST, this.filterModel).then((data: any) => {
      this.filterModel.export = false;

      var exportList = [];
      let index = 0;
      data.list.forEach(item => {

        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Status": item.status,
          "IsBukUpload": item.isBulkUpload,
          "Initiation Date": this.setDateFormate(item.initiatedDate),
          "Employee No": item.employeeNo,
          "Name": item.name,
          "Plant": item.plant,
          "Pay Group": item.payGroup,
          "Employee Category": item.employeeCategory,
          "Location": item.location,
          "Department": item.departmentName,
          "Designation": item.oldDesignation,
          "Role": item.oldRole,
          "Rating": item.rating,
          "Current Ctc": item.currentCTC,
          "New Ctc": item.newCTC,
          "Increment Amount": item.incrementAmount,

          // "Salary Type": item.salaryType,
          // "Recommended Salary": item.recommendedSalary,
          // "Is Promotion Recommended": item.isPromotionRecommended,
          // "Promotion Comment": item.promotionComment,
          // "Recommended Designation": item.recommendedDesignation,
          // "Recommended Role": item.recommendedRole,
          // "Special Achievement": item.specialAchievement,


          "Appraisal Type": item.appraisalType,
          "Initiator Type": item.appraisalInitiatorType,
          "Initiator By": item.initiatedBy,
          "Comment": item.comment,
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
      this.excelService.exportAsExcelFile(exportList, 'Appraisal_Recommendation_Review_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }
}
