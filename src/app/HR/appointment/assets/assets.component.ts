import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { NgForm } from '@angular/forms';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from '../../../shared/api-url';
import { AppointmentService } from '../../Services/appointmentService.service';
import { Util } from '../../Services/util.service';
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-appointment-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css'],
  providers: [AppointmentService, Util]
})

export class AssetsComponent implements OnInit {
  @ViewChild(NgForm) assetForm: NgForm;
  @Input() appointmentId: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  isLoading = false;
  assetsList: any[] = [];
  item: any = {};
  assetTypes: any[] = [];
  count: number = 0;
  isEdit: boolean = false;
  editIndex: number = -1;
  selectedAssetType: any = null;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private service: AppointmentService, private util: Util) { }

  ngOnInit() {
    this.getAssetTypes();
    this.LoadData();
  }

  LoadData() {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_ASSET_DETAILS + "/" + this.appointmentId ).then((data: any) => {
      if (data && data.length > 0) {
        this.assetsList = data;
        this.count = data.length;
        this.dataLoaded.emit("loaded");
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error("Error occurred while fetching details, please check the link.");
      this.assetsList = [];
    });
  }

  
  addData(files){
    if (files.length === 0){
      toastr.error("Please select an attachment file.");
      return;
    }  
    if(this.item.startDate != "")
      this.item.startDate = this.util.getFormatedDateTime(this.item.startDate);        
    if(this.item.returnDate != "")
      this.item.returnDate = this.util.getFormatedDateTime(this.item.returnDate); 
    
    const formData = new FormData();  
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "pdf" && ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png")
      {
        toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if(file.size > (2*1024*1024)){
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
      formData.append("Attachment", file);
      this.item.attachmentFileName = file.name;
    }
    toastr.info("Adding...");
    formData.append("AppointmentAssetId", "00");
    formData.append("AppointmentId", this.appointmentId.toString() );
    formData.append("AssetTypeId", this.selectedAssetType.id );
    formData.append("AssetNo", this.item.assetNo);
    formData.append("AssetValue", this.item.assetValue );
    formData.append("PerquisitesOn", this.item.perquisitesOn == undefined ? 0 : this.item.perquisitesOn );
    formData.append("StartDate", this.item.startDate );
    formData.append("ReturnDate", this.item.returnDate );
    formData.append("Remarks", this.item.remarks == undefined ? 0 : this.item.remarks);

    let connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_ASSET_DETAILS, formData);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        this.item.appointmentAssetId = data.id;
        this.onAddLineClick();
        toastr.success("Successfully added the asset details.");
      }
    }).catch(error => {
      //console.log(error);
      toastr.error('Error adding details...'+ error);
    })
  }

  updateData(files){
    if(this.item.startDate != "")
      this.item.startDate = this.util.getFormatedDateTime(this.item.startDate);        
    if(this.item.returnDate != "")
      this.item.returnDate = this.util.getFormatedDateTime(this.item.returnDate); 

      toastr.info("Updating...");
    const formData = new FormData();  
    if (files.length > 0){
      for (const file of files) {
        formData.append("Attachment", file);
        this.item.attachmentFileName = file.name;
      }
    }
    formData.append("AppointmentAssetId", this.item.appointmentAssetId);
    formData.append("AppointmentId", this.appointmentId.toString() );
    formData.append("AssetTypeId", this.selectedAssetType.id );
    formData.append("AssetNo", this.item.assetNo);
    formData.append("AssetValue", this.item.assetValue );
    formData.append("PerquisitesOn", this.item.perquisitesOn == undefined ? 0 : this.item.perquisitesOn );
    formData.append("StartDate", this.item.startDate );
    formData.append("ReturnDate", this.item.returnDate );
    formData.append("Remarks", this.item.remarks == undefined ? 0 : this.item.remarks);
    let connection = this.httpService.HRpostAttachmentFile(APIURLS.APPOINTMENT_SAVE_ASSET_DETAILS, formData);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {          
        this.onUpdateLine();
        toastr.success("Successfully updated the details.");
      }
    }).catch(error => {
      //console.log(error);
      toastr.error('Error updating details...'+ error);
    })
  }

  deleteData(id, no){
    if(id <= 0) return;
    if(!confirm("Are you sure you want to delete this record?")) return;

    let connection: any;
    let data: any = {};
    data.appointmentAssetId = id;
    connection = this.httpService.HRpost(APIURLS.APPOINTMENT_DELETE_ASSET_DETAILS, data);    
    toastr.info('Deleting...');
    connection.then(
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

  getFile(id, fileName){
    if(id <= 0) return;
    this.httpService.HRdownloadFile(APIURLS.APPOINTMENT_GET_ASSET_FILE+"/"+this.appointmentId+ "/" + id).then((data: any) => {
      // console.log(data);
      // let temp_name = this.visitorsList1.find(s => s.id == id).name;
      // if(data){
      //   var downloadURL = URL.createObjectURL(data);
      //   window.open(downloadURL);
      // }

      if (data != undefined) {
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }
 
  getAssetTypes(): any {      
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_ASSET_TYPES).then((data: any) => {
      if (data.length > 0) {
        this.assetTypes = data;
      }
    }).catch(error => {
      this.assetTypes=[];
    });
  }

  saveData(){
    toastr.success('Details saved successfully!');
    this.dataSaved.emit({success: true});
  }


  onAddLineClick(){    
    this.item.assetType = this.selectedAssetType.assetType;
    this.item.assetTypeId = this.selectedAssetType.id;
    this.assetsList.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedAssetType = this.assetTypes.find(x=>x.id==item.assetTypeId);
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateLine(){
    this.item.assetType = this.selectedAssetType.assetType;
    this.item.assetTypeId = this.selectedAssetType.id;    
    this.assetsList[this.editIndex] = this.item;    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.assetsList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.selectedAssetType = null;   
    this.assetForm.form.markAsPristine();
    this.assetForm.form.markAsUntouched();
  }

  keyPressAllowOnlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
  }
}
