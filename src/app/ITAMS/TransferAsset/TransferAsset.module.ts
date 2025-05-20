import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferAssetRoutingModule } from './TransferAsset-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { TransferAssetComponent } from './TransferAsset.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        TransferAssetRoutingModule
    ],
    declarations: [
        TransferAssetComponent
    ]
})
export class TransferAssetModule { }
