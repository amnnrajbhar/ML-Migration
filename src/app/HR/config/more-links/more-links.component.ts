import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { Util } from '../../Services/util.service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-more-links',
  templateUrl: './more-links.component.html',
  styleUrls: ['./more-links.component.css'],
  providers: [Util]
})
export class MoreLinksComponent implements OnInit {
  @ViewChild(NgForm , { static: false })  moreLinksForm!: NgForm;
  isLoading: boolean = false;
  currentUser!: AuthData;
  item: any = {};
  itemList: any[] = [];
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;

  constructor(private httpService: HttpService,
    private router: Router, private util: Util) {
     }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.getData();
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRget(APIURLS.HR_MORE_LINKS_API+"/GetAll").then((data: any) => {
      if(data && data.length > 0){
        this.itemList = data;      
        this.count = data.length;
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the list. Error: "+ error);
      this.isLoading = false;      
    });
  }

  
  addData(){
    
    toastr.info("Adding...");
    this.isLoading = true;
    this.item.createdById = this.currentUser.uid;
    this.item.createdDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
    
    this.httpService.HRpost(APIURLS.HR_MORE_LINKS_API, this.item)
    .then((data: any) => {
      if (data == 200 || data.moreLinkId > 0) {
        this.item.moreLinkId = data.moreLinkId;
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
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
    
    this.httpService.HRput(APIURLS.HR_MORE_LINKS_API, this.item.moreLinkId, this.item)
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

    let connection: any;
    let data: any = {};
    data.moreLinkId = id;
    toastr.info('Deleting...');
    this.isLoading = true;
    this.httpService.HRdelete(APIURLS.HR_MORE_LINKS_API, id)
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
    this.itemList.push(this.item);
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
    this.itemList[this.editIndex] = this.item;    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.itemList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.moreLinksForm.form.markAsPristine();
    this.moreLinksForm.form.markAsUntouched();
  }
}
