import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import { MasterDataService } from '../../Services/masterdata.service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-employee-rejoin-config',
  templateUrl: './employee-rejoin-config.component.html',
  styleUrls: ['./employee-rejoin-config.component.css'],  
  providers: [Util]
})
export class EmployeeRejoinConfigComponent implements OnInit {
@ViewChild(NgForm, { static: false }) detailsForm!: NgForm;

  isLoading: boolean = false;
  currentUser!: AuthData;
  filterModel: any = {};
  filterData: any = {}
  item: any = {};
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];

  constructor(private httpService: HttpService,
    private router: Router, private util: Util, private masterService: MasterDataService) {
     }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.masterService.getPlantList().then((data:any)=>{this.plantList = data;});
    this.masterService.getPayGroupList().then((data:any)=>{this.payGroupList = data;});
    this.masterService.getEmployeeCategoryList().then((data:any)=>{this.employeeCategoryList = data;});
    this.filterModel.pageSize = 10;    
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.getListData();
  }

  getListData(){    
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_REJOIN_CONFIG_GET_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;      
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the list. Error: "+ error);
      this.isLoading = false;      
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
  
  
  addData(){
    
    toastr.info("Adding...");
    this.isLoading = true;
    this.item.plantName = this.plantList.find(x=>x.id == this.item.plantId).name;
    this.item.payGroupName = this.payGroupList.find(x=>x.id == this.item.payGroupId).long_Desc;
    this.item.employeeCategoryName = this.employeeCategoryList.find(x=>x.id == this.item.employeeCategoryId).catltxt;
    
    this.item.createdByName = this.currentUser.firstName + " " + this.currentUser.lastName;
    this.item.createdById = this.currentUser.uid;
    this.item.createdDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedByName = this.currentUser.firstName + " " + this.currentUser.lastName;
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
    
    this.httpService.HRpost(APIURLS.HR_EMPLOYEE_REJOIN_CONFIG_API, this.item)
    .then((data: any) => {
      if (data == 200 || data.employeeRejoinConfigId > 0) {
        this.item.employeeRejoinConfigId = data.employeeRejoinConfigId;
        this.onAddLine();
        toastr.success("Successfully added the details.");        
        $("#detailsModal").modal("hide");
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error('Error adding details...'+ error);
    })
  }

  updateData(){
          
    toastr.info("Updating...");
    this.isLoading = true;
    this.item.plantName = this.plantList.find(x=>x.id == this.item.plantId).name;
    this.item.payGroupName = this.payGroupList.find(x=>x.id == this.item.payGroupId).long_Desc;
    this.item.employeeCategoryName = this.employeeCategoryList.find(x=>x.id == this.item.employeeCategoryId).catltxt;
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedByName = this.currentUser.firstName + " " + this.currentUser.lastName;

    this.httpService.HRput(APIURLS.HR_EMPLOYEE_REJOIN_CONFIG_API, this.item.employeeRejoinConfigId, this.item)
    .then((data: any) => {
      if (data == 200 || data.id > 0) {          
        this.onUpdateLine();
        toastr.success("Successfully updated the details.");
        $("#detailsModal").modal("hide");
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      toastr.error('Error updating details...'+ error);
    })
  }

  deleteData(id, no){
    if(id <= 0) return;
    if(!confirm("Are you sure you want to delete this record?")) return;

    toastr.info('Deleting...');
    this.isLoading = true;
    this.httpService.HRdelete(APIURLS.HR_EMPLOYEE_REJOIN_CONFIG_API, id)
    .then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Deleted successfully!');
          this.RemoveLine(no);
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

  onAddClick(){
    this.clearInput();
    $("#detailsModal").modal("show");
  }

  onAddLine(){
    this.filterData.list.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){    
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
    $("#detailsModal").modal("show");
  }

  onUpdateLine(){    
    this.filterData.list[this.editIndex] = this.item;    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.filterData.list.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.detailsForm.form.markAsPristine();
    this.detailsForm.form.markAsUntouched();
  }

}
