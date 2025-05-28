import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../../shared/api-url';
import { HttpService } from '../../../../shared/http-service';
import { AppService } from '../../../../shared/app.service';
import { AppComponent } from '../../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../../auth/auth.model';
import { ExcelService } from '../../../../shared/excel-service';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;
@Component({
  selector: 'app-approver-list',
  templateUrl: './approver-list.component.html',
  styleUrls: ['./approver-list.component.css']
})
export class ApproverListComponent implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private excelService: ExcelService) { }
  isEdit: boolean = false;
  editIndex: number = -1;
  filterModel: any = {};
  filterData: any = {};
  isLoading: boolean = false;
  currentUser!: AuthData;
  approverTypes = [{ type: "Appraisal" }, { type: "Confirmation" }, { type: "Resignation" }, { type: "Transfer" }];
  ngOnInit() {
    
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.type = "";
    this.filterModel.departmentId = "";
    this.filterModel.stateId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.staffCategoryId = "";
    this.filterModel.employeeId = "";
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.getAllDropDownValues();
    this.getData();
  }

  getAllDropDownValues() {
    this.getDepartments();
    this.getState();
    this.getPlantList();
    this.getEmployeeCategoryList();
  }

  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a:any, b:any) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch((error)=> {
      this.plantList = [];
    });
  }

  payGroupList: any[] = [];
  getPayGroupList() {
    
    if (this.filterModel.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  employeeCategoryList: any[] = [];
  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
      .then((data: any) => {
        if (data.length > 0) {
          this.employeeCategoryList = data.sort((a:any, b:any) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.employeeCategoryList = [];
      });    
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a:any, b:any) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch((error)=> {
      this.departmentList = [];
    });
  }

  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch((error)=> {
      this.stateList = [];
    });
  }



  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_GET_APPROVER_CONFIG_LIST, this.filterModel)

      .then((data: any) => {
        this.filterData = data;

        this.isLoading = false;
      }).catch((error)=> {
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

  editApproverConfig(approverConfigId: any) {
    let route = 'HR/config/approvers/approver-edit/' + approverConfigId;
    this.router.navigate([route]);
  }

  // deleteApprover(approverConfigId: any) {
  //   let route = 'HR/config/approvers/approver-edit/' + approverConfigId;
  //   this.router.navigate([route]);
  // }

  deleteApprover(id, no){
    if(id <= 0) return;
    if(!confirm("Are you sure you want to delete this record?")) return;

    let connection: any;
    let data: any = {};
    data.approverConfig = id;
    toastr.info('Deleting...');
    this.isLoading = true;
    this.httpService.HRdelete(APIURLS.HR_GET_APPROVER_DETAILS, id)
    .then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Deleted successfully!');
          this.filterData = [];
          this.getData();
          //this.RemoveLine(no);
        }
        else
        toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while deleting the details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while deleting the details. Error:' + error);
      });
  }

  // RemoveLine(no){
  //   if(no == this.editIndex && this.isEdit){
  //     this.clearInput();
  //   }else if(no < this.editIndex){
  //     this.editIndex--;
  //   }
  //   this.filterData.list.splice(no,1);
  //   this.count--;
  // }

  onAddClick() {
    let route = 'HR/config/approver-create';
    this.router.navigate([route]);
  }

}
