import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetLabelPrintRoutingModule } from './AssetLabelPrint-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { AssetLabelPrintComponent } from './AssetLabelPrint.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        AssetLabelPrintRoutingModule
    ],
    declarations: [
        AssetLabelPrintComponent
    ]
})
export class AssetLabelPrintModule { }
