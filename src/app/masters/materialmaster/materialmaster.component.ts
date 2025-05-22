import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { APIURLS } from './../../shared/api-url';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { MaterialMaster } from './materialmaster.model';
import * as _ from "lodash";
declare var jQuery: any;

@Component({
  selector: 'app-materialmaster',
  templateUrl: './materialmaster.component.html',
  styleUrls: ['./materialmaster.component.css']
})
export class MaterialmasterComponent implements OnInit {

  @ViewChild(NgForm) materialForm: NgForm;
  public tableWidget: any;
  companyId: number;
  materialList: MaterialMaster[] = [];
  materialItem: MaterialMaster = new MaterialMaster();
  isLoading: boolean = false;
  entityTabHeader: string;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  path: string = '';

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#materialTable');
    this.tableWidget = exampleId.DataTable({
      "order": []
    });
    this.isLoading = false;
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }

  ngOnInit() {
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if (chkaccess == true) {
      this.getMaterialMasterList();
    }
    else
      this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  onAddMaterial(isEdit: boolean, data: MaterialMaster) {
    this.materialForm.form.markAsPristine();
    this.materialForm.form.markAsUntouched();
    this.materialForm.form.updateValueAndValidity();

    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;

    if (this.isEdit) {
      // this.materialItem = data;
      Object.assign(this.materialItem, data);
    }
    else {
      this.materialItem = new MaterialMaster();
    }
    jQuery("#myModal").modal('show');
  }

  getMaterialMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_MATERIAL_ALL_API).then((data: any) => {
      this.isLoading = true;
      if (data.length > 0) {
        this.materialList = data;
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.materialList = [];
    });
  }
  onSaveMaterial(status: boolean) {
    this.errMsg = "";
    let connection: any;
    if (!this.materialList.some(s => s.materialCode.trim().toLowerCase() === this.materialItem.materialCode.trim().toLowerCase() && s.id != this.materialItem.id)) {
      if (!this.isEdit)
        connection = this.httpService.post(APIURLS.BR_MASTER_MATERIAL_POST_PUT_API, this.materialItem);
      else
        connection = this.httpService.put(APIURLS.BR_MASTER_MATERIAL_POST_PUT_API, this.materialItem.id, this.materialItem);

      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          jQuery("#myModal").modal('hide');
          this.errMsgPop1 = 'Material code saved successfully!';
          jQuery("#saveModal").modal('show');
          this.getMaterialMasterList();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving material data..';
      });
    }
    else {
      this.isLoadingPop = false;
      this.errMsgPop = 'Entered material code already exists';
    }
  }
  closeSaveModal() {
    jQuery("#saveModal").modal('hide');
  }

}
