import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';
import { MasterDataService } from '../../Services/masterdata.service';
declare var toastr: any;
import swal from 'sweetalert';

declare var $: any;
declare var toastr: any;
@Component({
  selector: 'app-allowance-master',
  templateUrl: './allowance-master.component.html',
  styleUrls: ['./allowance-master.component.css'],
  providers: [Util]
})
export class AllowanceMasterComponent implements OnInit {
  @ViewChild(NgForm) detailsForm: NgForm;
  isLoading: boolean = false;
  currentUser: AuthData;
  filterModel: any = {};
  filterData: any = {}
  item: any = {};
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  metroList = [{type: "Yes"}, {type: "No"}];
  

  constructor(private httpService: HttpService,
    private router: Router, private util: Util, private masterService: MasterDataService,  private excelService: ExcelService) {
     }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;  
    this.filterModel.metro = "";
    this.getListData();
  }

  getListData(){    
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.BR_GET_ALLOWANCE_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;      
      this.isLoading = false;
    }).catch(error => {
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
    if(this.item.statusBool)
    this.item.status = 1;
    if(this.item.metroBool)
    this.item.metro = "X"
    
    
    this.item.createdBy = this.currentUser.uid;
    this.item.createdOn = this.util.getFormatedDateTime(new Date());
    this.item.modifiedBy = this.currentUser.uid;
    this.item.modifiedOn = this.util.getFormatedDateTime(new Date());
    
    this.httpService.HRpost(APIURLS.BR_ALLOWANCE, this.item)
    .then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.item.id = data.id;
        toastr.success("Successfully added the details.");        
        $("#detailsModal").modal("hide");
        this.getData();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error('Error adding details...'+ error);
    })
  }

  updateData(){
          
    toastr.info("Updating...");
    this.isLoading = true;
    
    this.isLoading = true;
    if(this.item.statusBool)
    this.item.status = 1;
    if(this.item.metroBool)
    this.item.metro = "X"
    this.item.modifiedBy = this.currentUser.uid;
    this.item.modifiedOn = this.util.getFormatedDateTime(new Date());

    this.httpService.HRput(APIURLS.BR_ALLOWANCE, this.item.id, this.item)
    .then((data: any) => {
      if (data == 200 || data.id > 0) {          
        toastr.success("Successfully updated the details.");
        $("#detailsModal").modal("hide");
        this.getData();
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error('Error updating details...'+ error);
    })
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
  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_ALLOWANCE_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "SNo": index,
          "Allowance Type": item.allowanceType,
          "Effective From": this.setDateFormate(item.effectiveFrom),
          "Active": item.statusBool == true ? "Yes" : "No",
          "Metro": item.metroBool == true ? "Yes" : "No",
          "HQ": item.hq,
          "Show HQ": item.showHqValue == true ? "Yes" : "No",
          "EXHQ": item.exhq,
          "Show Ex-HQ": item.showExHqValue == true ? "Yes" : "No",
          "OS": item.os,
          "Show OS": item.showOsValue == true ? "Yes" : "No",
          "HS": item.hs,
          "MA": item.ma,
          "IA": item.ia,
          "SA": item.sa,
          "Created By": item.createdByName,
          "Created On": this.setDateFormate(item.createdOn),
          "Modified By": item.modifiedByName,
          "Modified On": this.setDateFormate(item.modifiedOn)
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'AllowanceMaster_List');
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
}