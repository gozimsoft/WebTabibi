<?php

function GetPathFolderGenerator()
{
    return "uploads/";
}
function GetPathFilesConst()
{
    return "uploads/filesconst/";
}
function addFolderToZip($folder, $zip, $baseFolder)
{
    $files = scandir($folder);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        $filePath = $folder . '/' . $file;
        $relativePath = substr($filePath, strlen($baseFolder) + 1);

        if (is_dir($filePath)) {
            $zip->addEmptyDir($relativePath);
            addFolderToZip($filePath, $zip, $baseFolder);
        } else {
            $zip->addFile($filePath, $relativePath);
        }
    }
}
function deleteFilesExceptZip($folder, $zipFilePath)
{
    $files = array_diff(scandir($folder), ['.', '..']);
    foreach ($files as $file) {
        $filePath = $folder . '/' . $file;
        if ($filePath === $zipFilePath) {
            continue; // لا تحذف ملف الـ ZIP
        }
        if (is_dir($filePath)) {
            deleteFilesExceptZip($filePath, $zipFilePath);
            rmdir($filePath);
        } else {
            unlink($filePath);
        }
    }
}
function GetPropertyFromJson($file_source, $nameprorerty)
{
    $start = strpos($file_source, '"' . $nameprorerty . '"');
    // استخراج النص بعد المفتاح
    $start = strpos($file_source, ":", $start) + 1;
    $end = strpos($file_source, '"', $start + 1);
    // الحصول على القيمة بين علامتي الاقتباس
    $text = substr($file_source, $start + 1, $end - $start - 1);
    $text = str_replace('*-*', "'", $text);
    $text = str_replace('*_*', '"', $text);
    return $text;
}

function CreateController($baseFolder, $NameTable, $NameClass, $fields)
{

    $path_Win_Other = GetPathFilesConst() . 'Win_Other.json';
    $Win_Other = file_get_contents($path_Win_Other);

    $path_Controller = $baseFolder . $NameTable . "/Controller" . $NameClass . ".pas";
    $DefinitionFieldsOnPrivate = '';
    $DefinitionFunctionFiledsStream = '';
    $DefinitionPropertyFieldsOnPublic = '';
    $CreateDefaultValueFields = '';
    $CreateFieldStream = '';
    $SaveFieldsStream = '';
    $LoadField = '';
    $SaveField = '';
    $BodyFunctionFiledsStream = '';
    $FreeFiledsStream = '';


    foreach ($fields as $field) {
        $NameField = $field['field_name'];
        $TypeField = $field['field_type'];
        $IsPrimaryKey = $field['is_primary'];
        $IsForeignKey = $field['is_foreign'];
        $_TypeField = '';
        if (strtoupper($TypeField) == 'DATETIME') {
            $_TypeField = 'T' . $TypeField;
        } else if (strtoupper($TypeField) == 'FLOAT') {
            $_TypeField = 'Double';
        } else if (strtoupper($TypeField) == 'IMAGE') {
            $_TypeField = 'TStream';
        } else {
            $_TypeField = $TypeField;
        }
        //  DefinitionFieldsOnPrivate 
        if (strtoupper($TypeField) == 'DATETIME') {
            $DefinitionFieldsOnPrivate .= 'F' . $NameField . ' :' . $_TypeField . ';' . PHP_EOL;
        } else if (strtoupper($TypeField) == 'FLOAT') {
            $DefinitionFieldsOnPrivate .= 'F' . $NameField . ' :' . $_TypeField . ' ;' . PHP_EOL;
        } else if (strtoupper(string: $TypeField) == 'IMAGE') {
            $DefinitionFieldsOnPrivate .= 'F' . $NameField . ' : ' . $_TypeField . ';' . PHP_EOL;
        } else {
            $DefinitionFieldsOnPrivate .= 'F' . $NameField . ' : ' . $TypeField . ';' . PHP_EOL;
        }
        // DefinitionFunctionFiledsStream 
        if (strtoupper($TypeField) == 'IMAGE') {
            $DefinitionFunctionFiledsStream .= ' function Get' . $NameField . ' :' . $_TypeField . ';' . PHP_EOL;
        }
        // DefinitionPropertyFieldsOnPublic 
        if (strtoupper($TypeField) == 'IMAGE') {
            $DefinitionPropertyFieldsOnPublic .= ' property ' . $NameField . ' : ' . $_TypeField . ' read Get' . $NameField . ' write  F' . $NameField . ' ;' . PHP_EOL;
        } else {
            $DefinitionPropertyFieldsOnPublic .= ' property ' . $NameField . ' : ' . $_TypeField . ' read F' . $NameField . ' write  F' . $NameField . ' ;' . PHP_EOL;
        }
        // CreateDefaultValueFields
        if (strtoupper($TypeField) == 'DATETIME') {
            $CreateDefaultValueFields .= $NameField . ' := Now;' . PHP_EOL;
        } else if (strtoupper($TypeField) == 'FLOAT') {
            $CreateDefaultValueFields .= $NameField . ' := 0;' . PHP_EOL;
        }
        // CreateFieldStream
        if (strtoupper($TypeField) == 'IMAGE') {
            $CreateFieldStream .= ' F' . $NameField . ' := TMemoryStream.Create;' . PHP_EOL;
        }
        //SaveFieldsStream
        if (strtoupper($TypeField) == 'IMAGE') {
            $save_image = GetPropertyFromJson($Win_Other, 'save_image');
            $save_image = str_replace('@fieldname', $NameField, $save_image);
            $SaveFieldsStream .= $save_image . PHP_EOL;
        }
        //LoadField 
        if (strtoupper($TypeField) != 'IMAGE') {
            $LoadField .= "F" . $NameField . " := Qry.FieldByName('" . $NameField . "').As" . $TypeField . " ;" . PHP_EOL;
        }
        //SaveField 
        if (strtoupper($TypeField) != 'IMAGE') {
            $SaveField .= " Qry.FieldByName('" . $NameField . "').As" . $TypeField . "  := F" . $NameField . " ;" . PHP_EOL;
        }
        // BodyFunctionFiledsStream
        if (strtoupper($TypeField) == 'IMAGE') {
            $functionfiledsstream = GetPropertyFromJson($Win_Other, 'bodyfunctionfiledsstream');
            $functionfiledsstream = str_replace('@fieldname', $NameField, $functionfiledsstream);
            $BodyFunctionFiledsStream .= $functionfiledsstream . PHP_EOL;
        }
        //FreeFiledsStream
        if (strtoupper($TypeField) == 'IMAGE') {
            $FreeFiledsStream .= 'F' . $NameField . '.Free; ' . PHP_EOL;
        }
    }

    // HEADUNIT
    $HEADUNIT = GetPropertyFromJson($Win_Other, 'MemHEADUNIT');
    $HEADUNIT = str_replace('@nameclass', $NameClass, $HEADUNIT);
    // HEADClASS
    $HEADClASS = GetPropertyFromJson($Win_Other, 'MemClASS');
    $HEADClASS = str_replace('@DefinitionFieldsOnPrivate', $DefinitionFieldsOnPrivate, $HEADClASS);
    $HEADClASS = str_replace('@DefinitionFunctionFiledsStream', $DefinitionFunctionFiledsStream, $HEADClASS);
    $HEADClASS = str_replace('@DefinitionPropertyFieldsOnPublic', $DefinitionPropertyFieldsOnPublic, $HEADClASS);
    $HEADClASS = str_replace('@nameclass', $NameClass, $HEADClASS);
    // BODYCLASS
    $BODYCLASS = GetPropertyFromJson($Win_Other, 'MemImplementation');
    $BODYCLASS = str_replace('@CreateDefaultValueFields', $CreateDefaultValueFields, $BODYCLASS);
    $BODYCLASS = str_replace('@CreateFieldStream', $CreateFieldStream, $BODYCLASS);
    $BODYCLASS = str_replace('@SaveFieldsStream', $SaveFieldsStream, $BODYCLASS);
    $BODYCLASS = str_replace('@BodyFunctionFiledsStream', $BodyFunctionFiledsStream, $BODYCLASS);
    $BODYCLASS = str_replace('@FreeFiledsStream', $FreeFiledsStream, $BODYCLASS);
    $BODYCLASS = str_replace('@nametable', $NameTable, $BODYCLASS);
    $BODYCLASS = str_replace('@LoadField', $LoadField, $BODYCLASS);
    $BODYCLASS = str_replace('@SaveField', $SaveField, $BODYCLASS);
    $BODYCLASS = str_replace('@nameclass', $NameClass, $BODYCLASS);

    $Controller = $HEADUNIT . $HEADClASS . $BODYCLASS;
    file_put_contents($path_Controller, $Controller);

    return true;

}
function CreateFolderTableWin($baseFolder, $NameTable, $NameClass, $fields)
{

    mkdir($baseFolder . $NameTable, 0777, true);
    CreateController($baseFolder, $NameTable, $NameClass, $fields);

    $path_Win_Other = GetPathFilesConst() . 'Win_Other.json';
    $Win_Other = file_get_contents($path_Win_Other);

    $path_Win_FormView = GetPathFilesConst() . 'Win_FormView.json';
    $Win_FormView = file_get_contents($path_Win_FormView);

    $path_Win_FormDetail = GetPathFilesConst() . 'Win_FormDetail.json';
    $Win_FormDetail = file_get_contents($path_Win_FormDetail);

    // View_unit
    $FIELD_GRID_VIEWS = '';
    $FIELDS_TABLE = '';
    // View_dfm  
    $ALL_CXGRID_DB_COLUMN = '';
    $FIELDS_TABLE_IN_CXGRID = '';
    // Detail_unit
    $PANELS_UNIT = '';
    $PROCEDURES_UNIT = '';
    $DefinitonBtnForgenKey = '';
    $Body_OnClick_BtnForgenKey = '';
    $Body_OnClick_Btn_EmptyImg = '';
    $Body_OnClick_Img = '';
    $freeitemsforgenkey = '';
    $ControllerForgenKey = '';
    $DefinitonProcedureLoadForgenKey = '';
    $LoadForgenKeyOnShow = '';
    $ProcedureLoadForgenKey = '';
    $Fields_Load = '';
    $Fields_Save = '';
    // Detail_dfm
    $Panel_Detail_DFM = '';

    foreach ($fields as $field) {
        $NameField = $field['field_name'];
        $TypeField = $field['field_type'];
        $IsPrimaryKey = $field['is_primary'];
        $IsForeignKey = $field['is_foreign'];
        $NameFieldForeign = '';
        if ($IsForeignKey == true) {
            $NameFieldForeign = substr($NameField, 0, -3);
        }
        $_TypeField = '';
        if (strtoupper($TypeField) == 'DATETIME') {
            $_TypeField = 'T' . $TypeField;
        } else if (strtoupper($TypeField) == 'FLOAT') {
            $_TypeField = 'Double';
        } else if (strtoupper($TypeField) == 'IMAGE') {
            $_TypeField = 'TStream';
        }

        // FIELD_GRID_VIEWS
        if ($IsPrimaryKey == false && $IsForeignKey == false && strtoupper($TypeField) != 'IMAGE') {
            $FIELD_GRID_VIEWS .= ' cxGrid1DBTableView3' . $NameField . ' : TcxGridDBColumn; ' . PHP_EOL;
        }
        //FIELDS_TABLE
        if (strtoupper($TypeField) != 'IMAGE') {
            $FIELDS_TABLE .= $NameTable . $NameField . ':T' . $TypeField . 'Field;' . PHP_EOL;
        }
        // ALL_CXGRID_DB_COLUMN
        if ($IsPrimaryKey == false && $IsForeignKey == false && strtoupper($TypeField) != 'IMAGE') {
            $MemCXGRIDDBCOLUMN = GetPropertyFromJson($Win_FormView, 'MemCXGRIDDBCOLUMN');
            $MemCXGRIDDBCOLUMN = str_replace('@namefiled', $NameField, $MemCXGRIDDBCOLUMN);
            $ALL_CXGRID_DB_COLUMN .= $MemCXGRIDDBCOLUMN . PHP_EOL;
        }
        // FIELDS_TABLE_IN_CXGRID
        if (strtoupper($TypeField) != 'IMAGE') {
            $_Size = '';
            $_DisplayFormat = '';
            if (strtoupper($TypeField) == 'DATETIME') {
                $_DisplayFormat = " DisplayFormat = 'DD/MM/YYYY' " . PHP_EOL;
            }
            if (strtoupper($TypeField) == 'FLOAT') {
                $_DisplayFormat = " DisplayFormat = '00.00' " . PHP_EOL;
            }
            if (strtoupper($TypeField) == 'STRING') {
                $_Size = " Size = 255 " . PHP_EOL;
            }

            $MemFILED_FDMEMOTABLE = GetPropertyFromJson($Win_FormView, 'MemFILED_FDMEMOTABLE');
            $MemFILED_FDMEMOTABLE = str_replace('@namefield', $NameField, $MemFILED_FDMEMOTABLE);
            $MemFILED_FDMEMOTABLE = str_replace('@nametable', $NameTable, $MemFILED_FDMEMOTABLE);
            $MemFILED_FDMEMOTABLE = str_replace('@typefield', $TypeField, $MemFILED_FDMEMOTABLE);
            $MemFILED_FDMEMOTABLE = str_replace('@displayformat', $_DisplayFormat, $MemFILED_FDMEMOTABLE);
            $MemFILED_FDMEMOTABLE = str_replace('@size', $_Size, $MemFILED_FDMEMOTABLE);
            $FIELDS_TABLE_IN_CXGRID .= $MemFILED_FDMEMOTABLE . PHP_EOL;
        }
        //PANELS_UNIT
        if ($IsPrimaryKey == false) {
            $_Panel = ' Pa' . $NameField . ': TPanel;  ' . PHP_EOL;

            if (strtoupper($TypeField) != 'BOOLEAN') {
                if ($IsForeignKey == true) {
                    $_Panel .= ' Lb' . $NameFieldForeign . ': TLabel; ' . PHP_EOL;
                    $_Panel .= ' Btn' . $NameFieldForeign . ': TcxButton; ' . PHP_EOL;
                } else {

                }
            }
            if ($IsForeignKey == true) {
                $_Panel .= ' Co' . $NameFieldForeign . ': TCombobox; ' . PHP_EOL;
            } else {
                if (strtoupper($TypeField) == 'DATETIME') {
                    $_Panel .= ' Dtp' . $NameField . ': TDateTimePicker; ' . PHP_EOL;
                } else
                    if (strtoupper($TypeField) == 'BOOLEAN') {
                        $_Panel .= ' Ch' . $NameField . ': TCheckBox; ' . PHP_EOL;
                    } else
                        if (strtoupper($TypeField) == 'IMAGE') {
                            $_Panel .= ' Im' . $NameField . ': TImage; ' . PHP_EOL;
                            $_Panel .= ' BtnEmpty' . $NameField . ': TcxButton; ' . PHP_EOL;
                        } else {
                            $_Panel .= ' Ed' . $NameField . ': TEdit; ' . PHP_EOL;
                        }

            }
            $PANELS_UNIT .= $_Panel . PHP_EOL;
        }
        // PROCEDURES_UNIT
        if (strtoupper($TypeField) == 'IMAGE') {
            $PROCEDURES_UNIT .= ' procedure BtnEmpty' . $NameField . 'Click(Sender: TObject);' . PHP_EOL;
            $PROCEDURES_UNIT .= ' procedure Im' . $NameField . 'Click(Sender: TObject);' . PHP_EOL;
        }
        // DefinitonBtnForgenKey
        if ($IsForeignKey == true) {
            $DefinitonBtnForgenKey .= ' procedure Btn' . $NameFieldForeign . 'Click(Sender: TObject);' . PHP_EOL;
        }

        // Body_OnClick_BtnForgenKey
        if ($IsForeignKey == true) {
            $_Body_OnClick_BtnForgenKey = GetPropertyFromJson($Win_Other, 'Body_OnClick_BtnForgenKey');
            $_Body_OnClick_BtnForgenKey = str_replace('@fieldname', $NameFieldForeign, $_Body_OnClick_BtnForgenKey);
            $Body_OnClick_BtnForgenKey .= $_Body_OnClick_BtnForgenKey . PHP_EOL;
        }
        // Body_OnClick_Btn_EmptyImg
        if (strtoupper($TypeField) == 'IMAGE') {
            $_Body_OnClick_Btn_EmptyImg = GetPropertyFromJson($Win_Other, 'body_btn_empty_img');
            $_Body_OnClick_Btn_EmptyImg = str_replace('@fieldname', $NameField, $_Body_OnClick_Btn_EmptyImg);
            $Body_OnClick_Btn_EmptyImg .= $_Body_OnClick_Btn_EmptyImg . PHP_EOL;
        }
        //Body_OnClick_Img 
        if (strtoupper($TypeField) == 'IMAGE') {
            $_Body_OnClick_Img = GetPropertyFromJson($Win_Other, 'body_img_onclick');
            $_Body_OnClick_Img = str_replace('@fieldname', $NameField, $_Body_OnClick_Img);
            $Body_OnClick_Img .= $_Body_OnClick_Img . PHP_EOL;
        }

        // freeitemsforgenkey
        if ($IsForeignKey == true) {
            $freeitemsforgenkey .= ' DM.FreeObjectCB(Co' . $NameFieldForeign . '.items) ; ' . PHP_EOL;
        }
        // ControllerForgenKey
        if ($IsForeignKey == true) {
            $ControllerForgenKey .= ' , Controller' . $NameFieldForeign . ' , ' . $NameFieldForeign . 'sUnit  ';
        }
        // DefinitonProcedureLoadForgenKey
        if ($IsForeignKey == true) {
            $DefinitonProcedureLoadForgenKey .= ' procedure Load' . $NameFieldForeign . 's ; ' . PHP_EOL;
        }
        // LoadForgenKeyOnShow
        if ($IsForeignKey == true) {
            $LoadForgenKeyOnShow .= '  Load' . $NameFieldForeign . 's ; ' . PHP_EOL;
        }
        // ProcedureLoadForgenKey
        if ($IsForeignKey == true) {
            $_ProcedureLoadForgenKey = GetPropertyFromJson($Win_Other, 'ProcedureLoadForgenKey');
            $_ProcedureLoadForgenKey = str_replace('@fieldname', $NameFieldForeign, $_ProcedureLoadForgenKey);
            $ProcedureLoadForgenKey .= $_ProcedureLoadForgenKey . PHP_EOL;
        }
        // Fields_Load
        if ($IsPrimaryKey == false) {

            if ($IsForeignKey == true) {
                $_Field = '  With T' . $NameFieldForeign . '.Create(' . $NameField . ') do ' . PHP_EOL .
                    ' try  ' . PHP_EOL . ' Co' . $NameFieldForeign . '.ItemIndex := Co' . $NameFieldForeign . '.items.IndexOf(ID); '
                    . PHP_EOL . ' finally  ' . PHP_EOL . 'free; ' . PHP_EOL . ' end; ';
            } else {
                if (strtoupper($TypeField) == 'DATETIME') {
                    $_Field = ' Dtp' . $NameField . '.Datetime := ' . $NameField . '; ';
                } else
                    if (strtoupper($TypeField) == 'FLOAT') {
                        $_Field = ' Ed' . $NameField . '.Text := (' . $NameField . ').tostring ; ';
                    } else
                        if (strtoupper($TypeField) == 'BOOLEAN') {
                            $_Field = ' Ch' . $NameField . '.Checked := ' . $NameField . '; ';
                        } else
                            if (strtoupper($TypeField) == 'INTEGER') {
                                $_Field = ' Ed' . $NameField . '.Text := (' . $NameField . ').tostring ; ';
                            } else
                                if (strtoupper($TypeField) == 'IMAGE') {
                                    $_Field = ' Im' . $NameField . '.Picture.LoadFromStream(' . $NameField . ');';
                                } else {
                                    $_Field = ' Ed' . $NameField . '.Text := ' . $NameField . '; ';
                                }

            }
            $Fields_Load .= $_Field . PHP_EOL;
        }
        // Fields_Save
        if ($IsPrimaryKey == false) {
            if ($IsForeignKey == true) {
                $_Field = $NameField . ':= T' . $NameFieldForeign . '(Co' . $NameFieldForeign .
                    ' .items.Objects[Co' . $NameFieldForeign . '.ItemIndex]).id;';
            } else {
                if (strtoupper($TypeField) == 'DATETIME') {
                    $_Field = $NameField . ' := Dtp' . $NameField . '.Datetime ; ';
                } else
                    if (strtoupper($TypeField) == 'FLOAT') {
                        $_Field = $NameField . ' := StrtoFloat(Ed' . $NameField . '.Text) ; ';
                    } else
                        if (strtoupper($TypeField) == 'BOOLEAN') {
                            $_Field = $NameField . ' := Ch' . $NameField . '.Checked ; ';
                        } else
                            if (strtoupper($TypeField) == 'INTEGER') {
                                $_Field = $NameField . ' := Strtoint(Ed' . $NameField . '.Text) ; ';
                            } else
                                if (strtoupper($TypeField) == 'IMAGE') {
                                    $_Field = ' Im' . $NameField . '.Picture.SaveToStream(' . $NameField . ');';
                                } else {
                                    $_Field = $NameField . ' := Ed' . $NameField . '.Text ; ';
                                }

            }
            $Fields_Load .= $_Field . PHP_EOL;
        }
        // Panel_Detail_DFM
        if ($IsPrimaryKey == false) {
            $_Panel = GetPropertyFromJson($Win_FormDetail, 'MemPanels');


            if (strtoupper($TypeField) != 'BOOLEAN') {
                $_Label = GetPropertyFromJson($Win_FormDetail, 'MemoLabel');
                if ($IsForeignKey == true) {
                    $_Label = str_replace('@FieldName', $NameFieldForeign, $_Label);
                } else {
                    $_Label = str_replace('@FieldName', $NameField, $_Label);
                }
                $_Panel = str_replace('@NAMEINPUT', $_Label, $_Panel);
            } else {
                $_Panel = str_replace('@NAMEINPUT', '', $_Panel);
            }
            if (strtoupper($TypeField) == 'DATETIME') {
                $_Date = GetPropertyFromJson($Win_FormDetail, 'MemDate');
                $_Date = str_replace('@FieldName', $NameField, $_Date);
                $_Panel = str_replace('@INPUT', $_Date, $_Panel);
            } else if (strtoupper($TypeField) == 'DATETIME') {
                $_Check = GetPropertyFromJson($Win_FormDetail, 'MemoCheck');
                $_Check = str_replace('@FieldName', $NameField, $_Check);
                $_Panel = str_replace('@INPUT', $_Check, $_Panel);
            } else if (strtoupper($TypeField) == 'IMAGE') {
                $_Image = GetPropertyFromJson($Win_FormDetail, 'MemoImage');
                $_Image = str_replace('@FieldName', $NameField, $_Image);

                $_Button = GetPropertyFromJson($Win_FormDetail, 'MemoButton');
                $_Button = str_replace('@FieldName', 'Empty', $_Button);
                $_Button = str_replace('@Caption', '-', $_Button);

                $_Panel = str_replace('@INPUT', $_Image . PHP_EOL . $_Button, $_Panel);
            } else {
                if ($IsForeignKey == true) {
                    $_Comobobx = GetPropertyFromJson($Win_FormDetail, 'MemoComobobx');
                    $_Comobobx = str_replace('@FieldName', $NameFieldForeign, $_Comobobx);
                    $_Button = GetPropertyFromJson($Win_FormDetail, 'MemoButton');
                    $_Button = str_replace('@FieldName', $NameFieldForeign, $_Button);
                    $_Panel = str_replace('@INPUT', $_Button . PHP_EOL . $_Comobobx, $_Panel);
                } else {
                    $_Edit = GetPropertyFromJson($Win_FormDetail, 'MemEdit');
                    $_Edit = str_replace('@FieldName', $NameField, $_Edit);
                    $_Panel = str_replace('@INPUT', $_Edit, $_Panel);
                }
            }
            $_Panel = str_replace('@FieldName', $NameField, $_Panel);
            $Panel_Detail_DFM .= $_Panel . PHP_EOL;
        }

    }

    // View_unit
    $Form_View_unit = GetPropertyFromJson($Win_FormView, 'MemUNITFrmView');
    $Form_View_unit = str_replace('@FIELD_GRID_VIEWS', $FIELD_GRID_VIEWS, $Form_View_unit);
    $Form_View_unit = str_replace('@FIELDS_TABLE', $FIELDS_TABLE, $Form_View_unit);
    $Form_View_unit = str_replace('@nametable', $NameTable, $Form_View_unit);
    $Form_View_unit = str_replace('@nameclass', $NameClass, $Form_View_unit);
    $path_Form_View_unit = $baseFolder . $NameTable . '/' . $NameTable . "Unit.pas";
    file_put_contents($path_Form_View_unit, $Form_View_unit);

    // View_dfm 
    $Form_View_dfm = GetPropertyFromJson($Win_FormView, 'MemDFMFrmView');
    $Form_View_dfm = str_replace('@ALL_CXGRID_DB_COLUMN', $ALL_CXGRID_DB_COLUMN, $Form_View_dfm);
    $Form_View_dfm = str_replace('@FIELDS_TABLE_IN_CXGRID', $FIELDS_TABLE_IN_CXGRID, $Form_View_dfm);
    $Form_View_dfm = str_replace('@nametable', $NameTable, $Form_View_dfm);
    $path_Form_View_dfm = $baseFolder . $NameTable . '/' . $NameTable . "Unit.dfm";
    file_put_contents($path_Form_View_dfm, $Form_View_dfm);

    // Detail_unit
    $Form_Detail_unit = GetPropertyFromJson($Win_FormDetail, 'MemUNITFrmDetail');
    $Form_Detail_unit = str_replace('@PANELS_UNIT', $PANELS_UNIT, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@PROCEDURES_UNIT', $PROCEDURES_UNIT, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@DefinitonBtnForgenKey', $DefinitonBtnForgenKey, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@Body_OnClick_BtnForgenKey', $Body_OnClick_BtnForgenKey, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@Body_OnClick_Btn_EmptyImg', $Body_OnClick_Btn_EmptyImg, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@Body_OnClick_Img', $Body_OnClick_Img, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@freeitemsforgenkey', $freeitemsforgenkey, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@ControllerForgenKey', $ControllerForgenKey, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@DefinitonProcedureLoadForgenKey', $DefinitonProcedureLoadForgenKey, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@LoadForgenKeyOnShow', $LoadForgenKeyOnShow, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@ProcedureLoadForgenKey', $ProcedureLoadForgenKey, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@Fields_Load', $Fields_Load, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@Fields_Save', $Fields_Save, $Form_Detail_unit);
    $Form_Detail_unit = str_replace('@nameclass', $NameClass, $Form_Detail_unit);
    $path_Form_Detail_unit = $baseFolder . $NameTable . "/Detail" . $NameClass . "Unit.pas";
    file_put_contents($path_Form_Detail_unit, $Form_Detail_unit);

    // Detail_dfm    
    $Form_Detail_dfm = GetPropertyFromJson($Win_FormDetail, 'MemDFMFrmDetail');
    $Form_Detail_dfm = str_replace('@Panel_Detail_DFM', $Panel_Detail_DFM, $Form_Detail_dfm);
    $Form_Detail_dfm = str_replace('@nameclass', $NameClass, $Form_Detail_dfm);
    $path_Form_Detail_dfm = $baseFolder . $NameTable . "/Detail" . $NameClass . "Unit.dfm";
    file_put_contents($path_Form_Detail_dfm, $Form_Detail_dfm);


    return true;
}
function CreateFolderTableApp($baseFolder, $NameTable, $NameClass, $fields)
{

    mkdir($baseFolder . $NameTable, 0777, true);
    CreateController($baseFolder, $NameTable, $NameClass, $fields);

    $path_Win_Other = GetPathFilesConst() . 'Win_Other.json';
    $Win_Other = file_get_contents($path_Win_Other);

    $path_App_Other = GetPathFilesConst() . 'App_Other.json';
    $App_Other = file_get_contents($path_App_Other);
    
    $path_App_Form = GetPathFilesConst() . 'App_Form.json';
    $App_Form = file_get_contents($path_App_Form);
    
    $path_App_Item = GetPathFilesConst() . 'App_Item.json';
    $App_Item = file_get_contents($path_App_Item);
    
    

    // View Unit
    $definitionallfields = '';
    $definitionallRectangles = '';
    $definitionallInput = '';
    $fieldsincreateitems = '';
    $fieldsallinload = '';
    $fieldsallinsave = '';
    //  View Fmx
    $fieldsallinrectangle = '';
    $definitionallfieldstable = '';
    // Item Unit
    $labelallfields = '';
    $layoutallfields = '';
    // Item FMX
    $fieldsallinitem = '';

    foreach ($fields as $field) {
        $NameField = $field['field_name'];
        $TypeField = $field['field_type'];
        $IsPrimaryKey = $field['is_primary'];
        $IsForeignKey = $field['is_foreign'];
        $_TypeField = '';
        if (strtoupper($TypeField) == 'DATETIME') {
            $_TypeField = 'T' . $TypeField;
        } else if (strtoupper($TypeField) == 'FLOAT') {
            $_TypeField = 'Double';
        } else if (strtoupper($TypeField) == 'IMAGE') {
            $_TypeField = 'TStream';
        }
        //definitionallfields 
        if ($IsForeignKey == false) {
            if (strtoupper($TypeField) == 'DATETIME') {
                $_Field = $NameTable . $NameField . ':TDateTimeField ; ';
            } else
                if (strtoupper($TypeField) == 'FLOAT') {
                    $_Field = $NameTable . $NameField . ':TFloatField ; ';
                } else
                    if (strtoupper($TypeField) == 'BOOLEAN') {
                        $_Field = $NameTable . $NameField . ':TBooleanField ; ';
                    } else
                        if (strtoupper($TypeField) == 'INTEGER') {
                            $_Field = $NameTable . $NameField . ':TIntegerField ; ';
                        } else {
                            $_Field = $NameTable . $NameField . ':TStringField ; ';
                        }
            $definitionallfields .= $_Field . PHP_EOL;
        }
        // definitionallRectangles
        if ($IsForeignKey == false && $IsPrimaryKey == false) {
            $definitionallRectangles .= 'Rec' . $NameField . ' : TRectangle; ' . PHP_EOL;
        }
        // definitionallInput 
        if ($IsForeignKey == false && $IsPrimaryKey == false) {
            if (strtoupper($TypeField) == 'DATETIME') {
                $_Field = 'De' . $NameField . ':TDateEdit; ';
            } else
                if (strtoupper($TypeField) == 'FLOAT') {
                    $_Field = 'Ed' . $NameField . ':TEdit ; ';
                } else
                    if (strtoupper($TypeField) == 'BOOLEAN') {
                        $_Field = 'Ch' . $NameField . ':TCheckBox ; ';
                    } else
                        if (strtoupper($TypeField) == 'INTEGER') {
                            $_Field = 'Ed' . $NameField . ':TEdit ; ';
                        } else if (strtoupper($TypeField) == 'IMAGE') {
                            $_Field = 'Im' . $NameField . ':TImage ; ';
                        } else if (strtoupper($TypeField) == 'STRING') {
                            $_Field = 'Ed' . $NameField . ':TEdit ; ';
                        }
            $definitionallInput .= $_Field . PHP_EOL;
        }
        // fieldsincreateitems
        if ($IsForeignKey == false) {
            if ($IsPrimaryKey == true) {
                $_Field = "Frame.ID := aDataSet.FieldByName('ID').AsString;";
            } else {
                $_Field = "Frame.Lb" . $NameField . ".text := aDataSet.FieldByName('" . $NameField . "').AsString;";

            }
            $fieldsincreateitems .= $_Field . PHP_EOL;
        }

        // fieldsallinload
        if ($IsForeignKey == false && $IsPrimaryKey == false) {
            $_Field= '';
            if (strtoupper($TypeField) == 'DATETIME') {
                $_Field = 'De' . $NameField . '.DateTime := ' . $NameField . ';';
            } else if (strtoupper($TypeField) == 'FLOAT') {
                $_Field = 'Ed' . $NameField . '.Text := ' . $NameField . '.ToString;';
            } else if (strtoupper($TypeField) == 'INTEGER') {
                $_Field = 'Ed' . $NameField . '.Text := ' . $NameField . '.ToString;';
            } else if (strtoupper($TypeField) == 'BOOLEAN') {
                $_Field = 'Ch' . $NameField . '.IsChecked := ' . $NameField . ';';
            } else if (strtoupper($TypeField) == 'STRING') {
                $_Field = 'Ed' . $NameField . '.Text := ' . $NameField . ';';
            }
            $fieldsallinload .= $_Field . PHP_EOL;
        }
        // fieldsallinsave
        if ($IsForeignKey == false && $IsPrimaryKey == false) {
            if (strtoupper($TypeField) == 'DATETIME') {
                $_Field = $NameField . ' := De' . $NameField . '.DateTime;';
            } else if (strtoupper($TypeField) == 'FLOAT') {
                $_Field = $NameField . ' :=  StrToFloat(Ed' . $NameField . '.Text);';
            } else if (strtoupper($TypeField) == 'INTEGER') {
                $_Field = $NameField . ' :=  StrToInt(Ed' . $NameField . '.Text);';
            } else if (strtoupper($TypeField) == 'BOOLEAN') {
                $_Field = $NameField . ' := Ch' . $NameField . '.IsChecked;';
            } else if (strtoupper($TypeField) == 'STRING') {
                $_Field = $NameField . ' :=  Ed' . $NameField . '.Text;';
            }
            $fieldsallinsave .= $_Field . PHP_EOL;
        }
        // fieldsallinrectangle
        if ($IsForeignKey == false && $IsPrimaryKey == false) {
            $_Field = GetPropertyFromJson($Win_Other, 'Rect_Input_App');

            if (strtoupper($TypeField) == 'DATETIME') {
                $IputField = GetPropertyFromJson($Win_Other, 'Input_datetime_App');
                $_Field = str_replace('@IputField', $IputField, $_Field);

            } else
                if (
                    strtoupper($TypeField) == 'FLOAT' ||
                    strtoupper($TypeField) == 'INTEGER' || strtoupper($TypeField) == 'STRING'
                ) {
                    $IputField = GetPropertyFromJson($Win_Other, 'Input_String_App');
                    $_Field = str_replace('@IputField', $IputField, $_Field);
                } else if (strtoupper($TypeField) == 'BOOLEAN') {
                    $IputField = GetPropertyFromJson($Win_Other, 'Input_boolean_App');
                    $_Field = str_replace('@IputField', $IputField, $_Field);
                } else if (strtoupper($TypeField) == 'IMAGE') {
                    $IputField = GetPropertyFromJson($Win_Other, 'Input_image_App');
                    $_Field = str_replace('@IputField', $IputField, $_Field);
                }
            $_Field = str_replace('@FieldName', $NameField, $_Field);
            $fieldsallinrectangle .= $_Field . PHP_EOL;
        }
        // definitionallfieldstable
        if ($IsForeignKey == false) {
            if (strtoupper($TypeField) == 'DATETIME') {
                $_Field = " object " . $NameTable . $NameField . ": TDatetimeField " .
                    PHP_EOL . " Alignment = taCenter " . PHP_EOL . " FieldName = '" . $NameField .
                    "'" . PHP_EOL . " end ";
            } else if (strtoupper($TypeField) == 'FLOAT') {
                $_Field = " object " . $NameTable . $NameField . ": TFloatField " .
                    PHP_EOL . " Alignment = taCenter " . PHP_EOL . " FieldName = '" . $NameField .
                    "'" . PHP_EOL . " end ";
            } else if (strtoupper($TypeField) == 'INTEGER') {
                $_Field = " object " . $NameTable . $NameField . ": TIntegerField " .
                    PHP_EOL . " Alignment = taCenter " . PHP_EOL . " FieldName = '" . $NameField .
                    "'" . PHP_EOL . " end ";
            } else if (strtoupper($TypeField) == 'BOOLEAN') {
                $_Field = " object " . $NameTable . $NameField . ": TBooleanField " .
                    PHP_EOL . " Alignment = taCenter " . PHP_EOL . " FieldName = '" . $NameField .
                    "'" . PHP_EOL . " end ";
            } else {
                $_Field = " object " . $NameTable . $NameField . ": TStringField " .
                    PHP_EOL . " Alignment = taCenter " . PHP_EOL . " FieldName = '" . $NameField .
                    "'" . PHP_EOL . " Size = 255 " . PHP_EOL . " end ";
            }
            $definitionallfieldstable .= $_Field . PHP_EOL;
        }
        // labelallfields     
        if ($IsPrimaryKey == false) {
            $labelallfields .= 'Lb' . $NameField . ': TLabel;' . PHP_EOL;
        }
        // layoutallfields     
        if ($IsPrimaryKey == false) {
            $layoutallfields .= 'Lay' . $NameField . ': TLayout;' . PHP_EOL;
        }
        //fieldsallinitem
        if ($IsPrimaryKey == false) {
            $_Field = " object Lay" . $NameField . " : TLayout " . " Align = Left " .
                " Position.X = 3.000000000000000000 " .
                " Size.Width = 86.000000000000000000 " .
                " Size.Height = 60.000000000000000000 " .
                " Size.PlatformDefault = False " . " TabOrder = 7 " . " object LB" .
                $NameField . ": TLabel " . " Align = Client " .
                " StyledSettings = [Family, Size, Style] " .
                " Size.Width = 86.000000000000000000 " .
                " Size.Height = 60.000000000000000000 " .
                " Size.PlatformDefault = False " . " Text = '" . $NameField . "' " .
                " TabOrder = 0 " . " end " . " end ";
            $fieldsallinitem .= $_Field . PHP_EOL;
        }

    }

    // View Unit    
    $path_Form_View_unit = $baseFolder . $NameTable . '/' . $NameTable . "Unit.pas";
    $Form_View_unit = GetPropertyFromJson($App_Form, 'MemUNITFrmViewApp');
    $Form_View_unit = str_replace('@definitionallfields', $definitionallfields, $Form_View_unit);
    $Form_View_unit = str_replace('@definitionallRectangles', $definitionallRectangles, $Form_View_unit);
    $Form_View_unit = str_replace('@definitionallInput', $definitionallInput, $Form_View_unit);
    $Form_View_unit = str_replace('@fieldsincreateitems', $fieldsincreateitems, $Form_View_unit);
    $Form_View_unit = str_replace('@fieldsallinload', $fieldsallinload, $Form_View_unit);
    $Form_View_unit = str_replace('@fieldsallinsave', $fieldsallinsave, $Form_View_unit);
    $Form_View_unit = str_replace('@nameclass', $NameClass, $Form_View_unit);
    file_put_contents($path_Form_View_unit, $Form_View_unit);

    // View FMX   
    $path_Form_View_fmx = $baseFolder . $NameTable . '/' . $NameTable . "Unit.fmx";
    $Form_View_fmx = GetPropertyFromJson($App_Form, 'MemDFMFrmViewApp');
    $Form_View_fmx = str_replace('@fieldsallinrectangle', $fieldsallinrectangle, $Form_View_fmx);
    $Form_View_fmx = str_replace('@definitionallfieldstable', $definitionallfieldstable, $Form_View_fmx);
    $Form_View_fmx = str_replace('@nameclass', $NameClass, $Form_View_fmx);
    file_put_contents($path_Form_View_fmx, $Form_View_fmx);


    // Item Unit
    $path_Form_Item_unit = $baseFolder . $NameTable . '/Item' . $NameClass . "Unit.pas";
    $Form_Item_unit = GetPropertyFromJson($App_Item, 'MemUNITFrmItemApp');
    $Form_Item_unit = str_replace('@labelallfields', $labelallfields, $Form_Item_unit);
    $Form_Item_unit = str_replace('@layoutallfields', $layoutallfields, $Form_Item_unit);
    $Form_Item_unit = str_replace('@nameclass', $NameClass, $Form_Item_unit);
    file_put_contents($path_Form_Item_unit, $Form_Item_unit);
    // Item FMX
    $path_Form_Item_fmx = $baseFolder . $NameTable . '/Item' . $NameClass . "Unit.fmx";
    $Form_Item_fmx = GetPropertyFromJson($App_Item, 'MemFMXFrmItemApp');
    $Form_Item_fmx = str_replace('@fieldsallinitem', $fieldsallinitem, $Form_Item_fmx);
    $Form_Item_fmx = str_replace('@nameclass', $NameClass, $Form_Item_fmx);
    file_put_contents($path_Form_Item_fmx, $Form_Item_fmx);





    return true;

}

function CreateProjectWin($NameProject, $baseFolder, $TablesData)
{
    $SQL_GET_ALL_TABLES = '';
    $path_Win_Other = GetPathFilesConst() . 'Win_Other.json';
    $Win_Other = file_get_contents($path_Win_Other);
    // dpr
    $AllFileAttachiWithProject = '';
    // dproj
    $DeclareAllFileInProject = '';
    // FormMainUnit
    $DeclartionNameBtnInMain = '';
    $DeclartionProcBtnInMain = '';
    $DeclartionBtnInMain = '';
    $DeclartionUnitInMain = '';
    $AllBodyBtnInMain = '';
    // FormMainDFM
    $AllBtnInMainDFM = '';


    foreach ($TablesData as $key => $table) {
        $NameTable = $table['table_name'];
        $NameClass = $table['class_name'];
        $fields = $table['fields'];
        // إنشاء المجلد باسم الجدول داخل $baseFolder
        CreateFolderTableWin($baseFolder, $NameTable, $NameClass, $fields);
        // const       
        $SQL_GET_ALL_TABLES .= " SQL_LOAD_" . strtoupper($NameTable) . " = '  Select * From " . $NameTable . " Where ID Like %s ';" . PHP_EOL;
        // dpr
        $FileAttachiWithProject = GetPropertyFromJson($Win_Other, 'FileAttachiWithProject');
        $FileAttachiWithProject = str_replace('@Nameclass', $NameClass, $FileAttachiWithProject);

        if ($key !== array_key_last($TablesData)) {
            $FileAttachiWithProject .= ', ';
        } else {
            $FileAttachiWithProject .= ';';
        }

        $AllFileAttachiWithProject .= $FileAttachiWithProject . PHP_EOL;

        // dproj
        $_DeclareAllFileInProject = GetPropertyFromJson($Win_Other, 'DeclareAllFileInProject');
        $_DeclareAllFileInProject = str_replace('@Nameclass', $NameClass, $_DeclareAllFileInProject);
        $DeclareAllFileInProject .= $_DeclareAllFileInProject . PHP_EOL;
        // FormMainUnit
        $_DeclartionNameBtnInMain = GetPropertyFromJson($Win_Other, 'DeclartionNameBtnInMain');
        $_DeclartionNameBtnInMain = str_replace('@Nameclass', $NameClass, $_DeclartionNameBtnInMain);
        $DeclartionNameBtnInMain .= $_DeclartionNameBtnInMain;

        $_DeclartionProcBtnInMain = GetPropertyFromJson($Win_Other, 'DeclartionProcBtnInMain');
        $_DeclartionProcBtnInMain = str_replace('@Nameclass', $NameClass, $_DeclartionProcBtnInMain);
        $DeclartionProcBtnInMain .= $_DeclartionProcBtnInMain;

        $DeclartionUnitInMain .= $NameTable . 'Unit';
        if ($key !== array_key_last($TablesData)) {
            $DeclartionUnitInMain .= ', ';
        } else {
            $DeclartionUnitInMain .= ';';
        }
        $_AllBodyBtnInMain = GetPropertyFromJson($Win_Other, 'AllBodyBtnInMain');
        $_AllBodyBtnInMain = str_replace('@Nameclass', $NameClass, $_AllBodyBtnInMain);
        $AllBodyBtnInMain .= $_AllBodyBtnInMain . PHP_EOL;

        // FormMainDFM        
        $_AllBtnInMainDFM = GetPropertyFromJson($Win_Other, 'AllBtnInMainDFM');
        $_AllBtnInMainDFM = str_replace('@Nameclass', $NameClass, $_AllBtnInMainDFM);
        $AllBtnInMainDFM .= $_AllBtnInMainDFM . PHP_EOL;

    }

    $DeclartionBtnInMain = $DeclartionNameBtnInMain . PHP_EOL . $DeclartionProcBtnInMain;


    $path_file_Win_DM = GetPathFilesConst() . 'Win_DM.json';

    $Win_DM = file_get_contents($path_file_Win_DM);

    // dm.pas
    $path_DM_pas = $baseFolder . "DMUnit.pas";
    $MemUnit_DMForAll = GetPropertyFromJson($Win_DM, 'MemUnit_DMForAll');
    file_put_contents($path_DM_pas, $MemUnit_DMForAll);
    // dm.dfm
    $path_DM_DFM = $baseFolder . "DMUnit.dfm";
    $MemDFM_DMForAll = GetPropertyFromJson($Win_DM, 'MemDFM_DMForAll');
    file_put_contents($path_DM_DFM, $MemDFM_DMForAll);

    $path_file_Win_Const_Controller = GetPathFilesConst() . 'Win_Const_Controller.json';
    $Win_Const_Controller = file_get_contents($path_file_Win_Const_Controller);

    // Controllers
    $path_Controllers = $baseFolder . "Controllers.pas";
    $MemControllerForAll = GetPropertyFromJson($Win_Const_Controller, 'MemControllerForAll');
    file_put_contents($path_Controllers, $MemControllerForAll);
    // const
    $path_const = $baseFolder . "consts.pas";
    $MemConstForAll = GetPropertyFromJson($Win_Const_Controller, 'MemConstForAll');
    $MemConstForAll = str_replace('@SQL_GET_ALL_TABLES', $SQL_GET_ALL_TABLES, $MemConstForAll);
    file_put_contents($path_const, $MemConstForAll);

    // dpr
    $path_project_dpr = $baseFolder . $NameProject . ".dpr";
    $ContentFile_dpr = GetPropertyFromJson($Win_Other, 'ContentFile_dpr');
    $ContentFile_dpr = str_replace('@nameproject', $NameProject, $ContentFile_dpr);
    $ContentFile_dpr = str_replace('@AllFileAttachiWithProject', $AllFileAttachiWithProject, $ContentFile_dpr);
    file_put_contents($path_project_dpr, $ContentFile_dpr);

    //dproj
    $path_project_dproj = $baseFolder . $NameProject . ".dproj";
    $ContentFile_dproj = GetPropertyFromJson($Win_Other, 'ContentFile_dproj');
    $ContentFile_dproj = str_replace('@nameproject', $NameProject, $ContentFile_dproj);
    $ContentFile_dproj = str_replace('@DeclareAllFileInProject', $DeclareAllFileInProject, $ContentFile_dproj);
    $ContentFile_dproj = str_replace('\\\\\\\\', '\\', $ContentFile_dproj);
    file_put_contents($path_project_dproj, $ContentFile_dproj);

    //  FormMainUnit
    $path_MainUnit = $baseFolder . "MainUnit.pas";
    $ContentFormMain = GetPropertyFromJson($Win_Other, 'ContentFormMain');
    $ContentFormMain = str_replace('@DeclartionBtnInMain', $DeclartionBtnInMain, $ContentFormMain);
    $ContentFormMain = str_replace('@DeclartionUnitInMain', $DeclartionUnitInMain, $ContentFormMain);
    $ContentFormMain = str_replace('@AllBodyBtnInMain', $AllBodyBtnInMain, $ContentFormMain);
    file_put_contents($path_MainUnit, $ContentFormMain);
    //  FormMainDFM
    $path_MainDFM = $baseFolder . "MainUnit.DFM";
    $ContentDFMFormMain = GetPropertyFromJson($Win_Other, 'ContentDFMFormMain');
    $ContentDFMFormMain = str_replace('@AllBtnInMainDFM', $AllBtnInMainDFM, $ContentDFMFormMain);
    file_put_contents($path_MainDFM, $ContentDFMFormMain);

    return true;
}
;
function CreateProjectAndroid($NameProject, $baseFolder, $TablesData)
{

    $SQL_GET_ALL_TABLES = '';
    $path_App_Other = GetPathFilesConst() . 'App_Other.json';
    $App_Other = file_get_contents($path_App_Other);

    // dpr  
    $AllFileAttachiWithProject = '';
    // dproj
    $DeclareAllFileInProject = '';

    // FormMainUnit
    $DeclartionNameBtnInMain = '';
    $DeclartionProcBtnInMain = '';
    $DeclartionBtnInMain = '';
    $DeclartionUnitInMain = '';
    $AllBodyBtnInMain = '';
    // FormMainDFM
    $AllBtnInMainDFM = '';

    foreach ($TablesData as $key => $table) {
        $NameTable = $table['table_name'];
        $NameClass = $table['class_name'];
        $fields = $table['fields'];
        // إنشاء المجلد باسم الجدول داخل $baseFolder        
         CreateFolderTableApp($baseFolder, $NameTable, $NameClass, $fields);
        // const 
        $SQL_GET_ALL_TABLES .= " SQL_LOAD_" . strtoupper($NameTable) . " = '  Select * From " . $NameTable . " Where ID Like %s ';" . PHP_EOL;
        // dpr        

        $FileAttachiWithProject = GetPropertyFromJson($App_Other, 'FileAttachiWithProject');
        $FileAttachiWithProject = str_replace('@Nameclass', $NameClass, $FileAttachiWithProject);
        if ($key !== array_key_last($TablesData)) {
            $AllFileAttachiWithProject .= $FileAttachiWithProject . ',' . PHP_EOL;
        } else {
            $AllFileAttachiWithProject .= $FileAttachiWithProject . ';' . PHP_EOL;
        }
        // dproj
        $_DeclareAllFileInProject = GetPropertyFromJson($App_Other, 'DeclareAllFileInProject');
        $_DeclareAllFileInProject = str_replace('@Nameclass', $NameClass, $_DeclareAllFileInProject);
        $DeclareAllFileInProject .= $_DeclareAllFileInProject . PHP_EOL;

        // DeclartionUnitInMain
        $DeclartionUnitInMain .= $NameTable . 'Unit';
        if ($key !== array_key_last($TablesData)) {
            $DeclartionUnitInMain .= ', ';
        } else {
            $DeclartionUnitInMain .= ';';
        }


        // FormMainUnit         
        $_DeclartionNameBtnInMain = GetPropertyFromJson($App_Other, 'DeclartionNameBtnInMain');
        $_DeclartionNameBtnInMain = str_replace('@Nameclass', $NameClass, $_DeclartionNameBtnInMain);
        $DeclartionNameBtnInMain .= $_DeclartionNameBtnInMain;

        $_DeclartionProcBtnInMain = GetPropertyFromJson($App_Other, 'DeclartionProcBtnInMain');
        $_DeclartionProcBtnInMain = str_replace('@Nameclass', $NameClass, $_DeclartionProcBtnInMain);
        $DeclartionProcBtnInMain .= $_DeclartionProcBtnInMain;

        $_AllBodyBtnInMain = GetPropertyFromJson($App_Other, 'AllBodyBtnInMain');
        $_AllBodyBtnInMain = str_replace('@Nameclass', $NameClass, $_AllBodyBtnInMain);
        $AllBodyBtnInMain .= $_AllBodyBtnInMain . PHP_EOL;

        // FormMainFMX
        $_AllBtnInMainDFM = GetPropertyFromJson($App_Other, 'AllBtnInMainDFM');
        $_AllBtnInMainDFM = str_replace('@Nameclass', $NameClass, $_AllBtnInMainDFM);
        $AllBtnInMainDFM .= $_AllBtnInMainDFM . PHP_EOL;

    }
    $DeclartionBtnInMain = $DeclartionNameBtnInMain . $DeclartionProcBtnInMain;

    $path_file_app_DM = GetPathFilesConst() . 'App_const.json';
    $App_const = file_get_contents($path_file_app_DM);

    // dm.pas
    $path_DM_pas = $baseFolder . "DMUnit.pas";
    $MemUnit_DMForAll = GetPropertyFromJson($App_const, 'MemUnit_DMForAll');
    file_put_contents($path_DM_pas, $MemUnit_DMForAll);
    // dm.dfm
    $path_DM_FMX = $baseFolder . "DMUnit.dfm";
    $MemDFM_DMForAll = GetPropertyFromJson($App_const, 'MemDFM_DMForAll');
    file_put_contents($path_DM_FMX, $MemDFM_DMForAll);

    $path_file_Win_Const_Controller = GetPathFilesConst() . 'Win_Const_Controller.json';
    $Win_Const_Controller = file_get_contents($path_file_Win_Const_Controller);

    // Controllers
    $path_Controllers = $baseFolder . "Controllers.pas";
    $MemControllerForAll = GetPropertyFromJson($App_const, 'MemControllerForAll');
    file_put_contents($path_Controllers, $MemControllerForAll);
    // const
    $path_const = $baseFolder . "consts.pas";
    $MemConstForAll = GetPropertyFromJson($App_const, 'MemConstForAll');
    $MemConstForAll = str_replace('@SQL_GET_ALL_TABLES', $SQL_GET_ALL_TABLES, $MemConstForAll);
    file_put_contents($path_const, $MemConstForAll);

    // dpr
    $path_project_dpr = $baseFolder . $NameProject . ".dpr";
    $ContentFile_dpr = GetPropertyFromJson($App_Other, 'ContentFile_dpr');
    $ContentFile_dpr = str_replace('@nameproject', $NameProject, $ContentFile_dpr);
    $ContentFile_dpr = str_replace('@AllFileAttachiWithProject', $AllFileAttachiWithProject, $ContentFile_dpr);
    file_put_contents($path_project_dpr, $ContentFile_dpr);

    //dproj
    $path_project_dproj = $baseFolder . $NameProject . ".dproj";
    $ContentFile_dproj = GetPropertyFromJson($App_Other, 'ContentFile_dproj');
    $ContentFile_dproj = str_replace('@nameproject', $NameProject, $ContentFile_dproj);
    $ContentFile_dproj = str_replace('\\\\\\\\', '\\', $ContentFile_dproj);
    $ContentFile_dproj = str_replace('@DeclareAllFileInProject', $DeclareAllFileInProject, $ContentFile_dproj);
    file_put_contents($path_project_dproj, $ContentFile_dproj);

    //  FormMainUnit
    $path_MainUnit = $baseFolder . "MainUnit.pas";
    $ContentFormMain = GetPropertyFromJson($App_Other, 'ContentFormMain');
    $ContentFormMain = str_replace('@DeclartionBtnInMain', $DeclartionBtnInMain, $ContentFormMain);
    $ContentFormMain = str_replace('@DeclartionUnitInMain', $DeclartionUnitInMain, $ContentFormMain);
    $ContentFormMain = str_replace('@AllBodyBtnInMain', $AllBodyBtnInMain, $ContentFormMain);
    file_put_contents($path_MainUnit, $ContentFormMain);
    //  FormMainFMX
    $path_Mainfmx = $baseFolder . "MainUnit.fmx";
    $ContentDFMFormMain = GetPropertyFromJson($App_Other, 'ContentDFMFormMain');
    $ContentDFMFormMain = str_replace('@AllBtnInMainDFM', $AllBtnInMainDFM, $ContentDFMFormMain);
    file_put_contents($path_Mainfmx, $ContentDFMFormMain);


    return true;
}
;
function GeneratorProject(
    $FolderProject,
    $NameProject,
    $TablesData
) {
    $baseFolder = GetPathFolderGenerator() . $FolderProject;
    $zipFilePath = $baseFolder . "/" . $NameProject . ".zip";
    mkdir($baseFolder . '/win', 0777, true);
    mkdir($baseFolder . '/Android', 0777, true);
    mkdir($baseFolder . '/Android/Library', 0777, true);
    // copy const file
    copy(GetPathFilesConst() . '/LibraryGS.zip', $baseFolder . '/LibraryGS.zip');
    copy(GetPathFilesConst() . '/UsedLibrary.txt', $baseFolder . '/UsedLibrary.txt');
    copy(GetPathFilesConst() . '/Library/FrameListBoxItem.pas', $baseFolder . '/Android/Library/FrameListBoxItem.pas');
    // 
    CreateProjectWin($NameProject, $baseFolder . '/win/', $TablesData);
    CreateProjectAndroid($NameProject, $baseFolder . '/Android/', $TablesData);

    $zip = new ZipArchive();
    if ($zip->open($zipFilePath, ZipArchive::CREATE) === TRUE) {
        addFolderToZip($baseFolder, $zip, $baseFolder);
        $zip->close();
        // حذف الملفات والمجلدات، لكن إبقاء ملف ZIP
        //   deleteFilesExceptZip($baseFolder, $zipFilePath);
        return $zipFilePath;
    }

}







?>