import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import {Pipe, PipeTransform} from "@angular/core";

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css'],
  providers: [Util]
})
export class AnnouncementsComponent implements OnInit {
  @ViewChild(NgForm , { static: false })  announcementForm: NgForm;
  isLoading: boolean = false;
  currentUser: AuthData;
  filterData: any = {};
  filterModel:any = {};
  item: any = {};
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  editorConfig: AngularEditorConfig = {};

  applicableList: AnnouncementApplicable[] = [];
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  stateList: any[] = [];
  departmentList:any[]=[];

  constructor(private httpService: HttpService,
    private router: Router, private util: Util) {
     }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    this.filterModel.pageSize = 10;
    this.filterModel.export = false;
    //this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.selectedPlantId = null;
    this.filterModel.selectedEmployeeCategoryId = null;
    this.filterModel.selectedPayGroupId = null;
    this.filterModel.selectedStateId = null;
    this.filterModel.selectedDepartmentId = null;
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
    this.getState();
    this.getDepartments();
    this.getDataList();
  }
  
  getDataList() {    
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
    this.httpService.HRpost(APIURLS.HR_ANNOUNCEMENT_GET_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;     
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  addData(files){
    
    const formData = new FormData();  
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
      {
        toastr.error("Only jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if(file.size > (2*1024*1024)){
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
      formData.append("Attachment", file);
      this.item.imageFileName = file.name;
    }
    toastr.info("Adding...");
    this.isLoading = true;
    formData.append("AnnouncementId", "00");
    formData.append("EffectiveFromDate", this.util.getFormatedDateTime(this.item.effectiveFromDate) );
    formData.append("EffectiveToDate", this.util.getFormatedDateTime(this.item.effectiveToDate) );
    formData.append("Title", this.item.title );
    formData.append("ShortDescription", this.item.shortDescription != undefined ? this.item.shortDescription : "" );
    formData.append("Description", this.item.description != undefined ? this.item.description : "" );
    formData.append("IsActive", this.item.isActive != undefined ? this.item.isActive : false );    
    formData.append("CreatedById", this.currentUser.uid.toString() );    
    var index =0; 
    this.applicableList.forEach(function(item){
      formData.append("ApplicableList["+index+"][plantId]", item.plantId == null ? "": item.plantId.toString());  
      formData.append("ApplicableList["+index+"][payGroupId]", item.payGroupId == null ? "": item.payGroupId.toString());  
      formData.append("ApplicableList["+index+"][employeeCategoryId]", item.employeeCategoryId == null ? "": item.employeeCategoryId.toString());  
      formData.append("ApplicableList["+index+"][departmentId]", item.departmentId == null ? "": item.departmentId.toString());  
      formData.append("ApplicableList["+index+"][stateId]", item.stateId == null ? "": item.stateId.toString());  
      index++;
    });
    //formData.append("ApplicableList", JSON.stringify(this.applicableList));    
    
    this.httpService.HRpostAttachmentFile(APIURLS.HR_ANNOUNCEMENT_SAVE_ANNOUNCEMENT_DETAILS, formData)
    .then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.item.announcementId = data.id;
        this.onAddLine();
        toastr.success("Successfully added the details.");        
        $("#detailsModal").modal("hide");
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error('Error adding details...'+ error);
    })
  }

  updateData(files){
          
    const formData = new FormData();  
    if (files.length > 0){
      for (const file of files) {
        var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
      {
        toastr.error("Only jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if(file.size > (2*1024*1024)){
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
        formData.append("Attachment", file);
        this.item.imageFileName = file.name;
      }
    }
    toastr.info("Updating...");
    this.isLoading = true;
    formData.append("AnnouncementId", this.item.announcementId);
    formData.append("EffectiveFromDate", this.util.getFormatedDateTime(this.item.effectiveFromDate) );
    formData.append("EffectiveToDate", this.util.getFormatedDateTime(this.item.effectiveToDate) );
    formData.append("Title", this.item.title );
    formData.append("ShortDescription", this.item.shortDescription != undefined ? this.item.shortDescription : "" );
    formData.append("Description", this.item.description != undefined ? this.item.description : "" );
    formData.append("IsActive", this.item.isActive != undefined ? this.item.isActive : false );     
    formData.append("ModifiedById", this.currentUser.uid.toString() );   
    var index =0; 
    this.applicableList.forEach(function(item){
      formData.append("ApplicableList["+index+"][plantId]", item.plantId == null ? "": item.plantId.toString());  
      formData.append("ApplicableList["+index+"][payGroupId]", item.payGroupId == null ? "": item.payGroupId.toString());  
      formData.append("ApplicableList["+index+"][employeeCategoryId]", item.employeeCategoryId == null ? "": item.employeeCategoryId.toString());  
      formData.append("ApplicableList["+index+"][departmentId]", item.departmentId == null ? "": item.departmentId.toString());  
      formData.append("ApplicableList["+index+"][stateId]", item.stateId == null ? "": item.stateId.toString());   
      index++;
    });
    //formData.append("ApplicableList", JSON.stringify(this.applicableList));    

    this.httpService.HRpostAttachmentFile(APIURLS.HR_ANNOUNCEMENT_SAVE_ANNOUNCEMENT_DETAILS, formData)
    .then((data: any) => {
      if (data == 200 || data.id > 0) {          
        this.onUpdateLine();
        toastr.success("Successfully updated the details.");
        $("#detailsModal").modal("hide");
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error('Error updating details...'+ error);
    })
  }

  deleteData(id, no){
    if(id <= 0) return;
    if(!confirm("Are you sure you want to delete this record?")) return;

    let connection: any;
    let data: any = {};
    data.announcement = id;
    toastr.info('Deleting...');
    this.isLoading = true;
    this.httpService.HRdelete(APIURLS.HR_ANNOUNCEMENT_API, id)
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
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while deleting the details. Error:' + error);
      });
  }

  onAddClick(){
    this.clearInput();
    $("#detailsModal").modal("show");
  }

  onAddLine(){
    this.filterData.list.unshift(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){    
    this.item = Object.assign({}, item);
    this.applicableList = item.applicableList;
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

  cancel(){    
    $("#detailsModal").modal("hide");
    this.clearInput();
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.applicableList = [];
    this.announcementForm.form.markAsPristine();
    this.announcementForm.form.markAsUntouched();
  }

  addApplicableData(){    
    //this.applicableList.push({plantId: null, payGroupId: null, employeeCategoryId: null, departmentId: null, stateId: null});
    this.applicableList.push(new AnnouncementApplicable());
  }
  
  deleteApplicableData(no){   
    this.applicableList.splice(no, 1);
  }
  
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_PLANT_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  getPayGroupList() {
    this.payGroupList = [];
    this.httpService.HRget(APIURLS.OFFER_PAYGROUP_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
      }
    }).catch(error => {
      this.payGroupList = [];
    });
  }

  getEmployeeCategoryList() {
    this.httpService.HRget(APIURLS.OFFER_EMPLOYEE_CATEGORY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
      }
    }).catch(error => {
      this.employeeCategoryList = [];
    });   
  }

  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch(error => {
      this.stateList = [];
    });
  }

  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }
}

export class AnnouncementApplicable{
  plantId: any;
  payGroupId: any;
  employeeCategoryId: any;
  departmentId: any;
  stateId: any;

  constructor(){
    this.plantId = null;
    this.payGroupId = null;
    this.employeeCategoryId = null;
    this.departmentId = null;
    this.stateId = null;
  }
}
