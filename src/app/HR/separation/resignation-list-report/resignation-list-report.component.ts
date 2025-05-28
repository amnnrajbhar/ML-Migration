import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { ResignationListReportFilter } from './resignationlistreportfilter.model';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { MasterDataService } from '../../Services/masterdata.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-resignation-list-report',
  templateUrl: './resignation-list-report.component.html',
  styleUrls: ['./resignation-list-report.component.css'],
  providers: [MasterDataService]
})
export class ResignationListReportComponent implements OnInit {
  id: number = 0;
  action: string;
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  departmentList: any[] = [];
  locationList: any[] = [];
  locationFullList: any[] = [];
  stateList: any[] = [];
  filterData: any = {};
  currentUser: AuthData;
  resignationId: number = 0;
  comments: string;
  reisinationList1: any[] = [];
  genderList: any[] = [
    { id: 1, name: 'Any' },
    { id: 2, name: 'Female' },
    { id: 2, name: 'Male' },
  ];
  typeList: any[] = [
    { id: 1, name: 'Resignation' },
    { id: 2, name: 'Service Withdrawal' },
  ];
  optionList: any[] = [
    { id: 1, name: 'Serving Notice Period' },
    { id: 2, name: 'Completed Notice Period' },
  ];
  shortfallNoticeFilterList = [{ type: "With Shortfall Notice" }];  
  filterModel: ResignationListReportFilter = {} as ResignationListReportFilter;
  constructor(private httpService: HttpService,private masterService: MasterDataService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService) {
      currentUser: AuthData;
     }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.filterModel.selectedDepartmentId = "";
    this.filterModel.pageNo = 1;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.name = "";
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedFromdate = "";
    this.filterModel.selectedTodate = "";    
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("ResignationListReport");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }
    this.getData();
    this.masterService.getPlantList().then((data:any)=>{this.plantList = data;});
    this.masterService.getPayGroupList().then((data:any)=>{this.payGroupList = data;});
    this.masterService.getDepartments().then((data:any)=>{this.departmentList = data;});
    this.masterService.getDesignation().then((data:any)=>{this.designationList = data;});
    this.masterService.getState().then((data:any)=>{this.stateList = data;});
    this.masterService.getLocation().then((data:any)=>{this.locationFullList = data;});
    this.getEmployeeCategoryList();
    }

    getPayGroupList() {
      this.filterModel.selectedPayGroupId = null;
      
      if (this.filterModel.selectedPlantId > 0) {
        this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
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
  
      getLocationList(){
      this.filterModel.selectedLocationId = "";
      if(this.filterModel.selectedStateId > 0)
        this.locationList = this.locationFullList.filter(x=>x.stateID == this.filterModel.selectedStateId);
      else 
        this.locationList = [];    
    }

    onStateChanged() {
     var selectedState = this.stateList.find(x=>x.id == this.filterModel.selectedStateId);
    if(selectedState)
      this.locationList = this.locationFullList.filter(x => x.stateId == selectedState.bland);
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
  
  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }

  resigList: any[] = [];
  getResignationList() {
    this.filterModel.pageNo = 1;    
       
    if(this.filterModel.selectedFromdate == undefined || this.filterModel.selectedFromdate == '')
    {
        toastr.error("Select From Date");
        return;
    } 
    if(this.filterModel.selectedTodate == undefined || this.filterModel.selectedTodate == '')
    {
        toastr.error("Select ToDate Date");
        return;
    } 
    if(this.filterModel.selectedFromdate > this.filterModel.selectedTodate)
    {
        toastr.error("From Date Should Be Less Than ToDate ");
        return;
    } 
    this.getData();     
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RESIGNATION_LIST_REPORT, this.filterModel).then((data: any) => {
      this.filterData = data;

      // store the filter model
      this.dataStore.SetData("ResignationListReport", this.filterModel);
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  setDateFormate(date: any): string {
    if(date == null || date == undefined || date == "") return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }


  resignationList1: any[] = [];
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.RESIGNATION_LIST_REPORT, this.filterModel).then((data: any) => {
      this.resignationList1 = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      this.resignationList1.forEach(item => {
        index=index+1;
                                                                                                

        let exportItem={
          "Sl No":index,
          "Employee No.": item.employeeNo,
          "Employee Name": item.fullName,
          "Designation": item.designation,
          "Role": item.role,
          "Department": item.department,
          "Sub Department": item.subDepartmentName,
          "Reporting Group": item.reportingGroupName,          
          "Plant Code": item.plantCode,
          "Plant Name": item.plantName,
          "Paygroup Name": item.payGroupName,
          "Reporting Manager": item.reportingManagerName,
          "HOD": item.approvingManagerName,             
          "Location": item.location,                    
          "Grade": item.grade,
          "Roll": item.role,
          "Date Of Birth": this.setDateFormate(item.dateOfBirth),
          "Age": item.age,          
          "Date Of Joining": this.setDateFormate(item.dateOfJoining), 
          "Probation Period": item.probationPeriod,              
          "Confirmation Date": this.setDateFormate(item.confirmationDate),
          "No. Of Years Worked": item.tenure,          
          "Total Experience": item.tenure,
          "Serving Notice Period": item.status,     
          "Leaving Date": item.dateOfLeaving,
          "Current CTC" : item.currentCTC,
          "Monthly Gross" : item.monthlyGross,
          "Resignation Type" :item.resignationType,
   
                                            
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Resignation_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }

  submitForApproval(id) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.resignationId = id;
      request.submittedById = this.currentUser.uid;
      toastr.info("Submitting...");
      this.httpService.HRpost(APIURLS.RESIGNATION_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.reisinationList1= null;
            this.getResignationList();
            toastr.success("Successfully submitted for approval.");
          } else if (!data.success) {
            toastr.error(data.message);
          } else
          toastr.error("Error occurred.");
        }).catch(error => {
          toastr.error(error);
        });
    }
  }

  }
