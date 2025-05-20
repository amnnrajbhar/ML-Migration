import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeAssetDetailsComponent } from './ChangeAssetDetails.component';
import { ChangeAssetDetailsRoutingModule } from './ChangeAssetDetails-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ChangeAssetDetailsRoutingModule
    ],
    declarations: [
        ChangeAssetDetailsComponent
    ]
})
export class ChangeAssetDetailsModule { }
