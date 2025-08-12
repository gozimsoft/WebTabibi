
unit CreditsUnit;
 interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants,
  System.Classes, Vcl.Graphics,    System.UiTypes,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, cxGraphics, cxControls, cxLookAndFeels,
  cxLookAndFeelPainters, cxStyles, dxSkinsCore, dxSkinBlack, dxSkinBlue,
  dxSkinBlueprint, dxSkinCaramel, dxSkinCoffee, dxSkinDarkRoom, dxSkinDarkSide,
  dxSkinDevExpressDarkStyle, dxSkinDevExpressStyle, dxSkinFoggy,
  dxSkinGlassOceans, dxSkinHighContrast, dxSkiniMaginary, dxSkinLilian,
  dxSkinLiquidSky, dxSkinLondonLiquidSky, dxSkinMcSkin, dxSkinMetropolis,
  dxSkinMetropolisDark, dxSkinMoneyTwins, dxSkinOffice2007Black,
  dxSkinOffice2007Blue, dxSkinOffice2007Green, dxSkinOffice2007Pink,
  dxSkinOffice2007Silver, dxSkinOffice2010Black, dxSkinOffice2010Blue,
  dxSkinOffice2010Silver, dxSkinOffice2013DarkGray, dxSkinOffice2013LightGray,
  dxSkinOffice2013White, dxSkinOffice2016Colorful, dxSkinOffice2016Dark,
  dxSkinPumpkin, dxSkinSeven, dxSkinSevenClassic, dxSkinSharp, dxSkinSharpPlus,
  dxSkinSilver, dxSkinSpringTime, dxSkinStardust, dxSkinSummer2008,
  dxSkinTheAsphaltWorld, dxSkinTheBezier, dxSkinsDefaultPainters,
  dxSkinValentine, dxSkinVisualStudio2013Blue, dxSkinVisualStudio2013Dark,
  dxSkinVisualStudio2013Light, dxSkinVS2010, dxSkinWhiteprint,
  dxSkinXmas2008Blue, cxCustomData, cxFilter, cxData, cxDataStorage, cxEdit,
  cxNavigator, cxDataControllerConditionalFormattingRulesManagerDialog, Data.DB,
  cxDBData, FireDAC.Stan.Intf, FireDAC.Stan.Option, FireDAC.Stan.Param,
  FireDAC.Stan.Error, FireDAC.DatS, FireDAC.Phys.Intf, FireDAC.DApt.Intf,
  FireDAC.Stan.Async, FireDAC.DApt, FireDAC.Comp.DataSet, FireDAC.Comp.Client,
  cxGridLevel, dxLayoutContainer, cxGridInplaceEditForm, cxGridCustomTableView,
  cxGridTableView, cxGridDBTableView, cxClasses, cxGridCustomView, cxGrid,
  Vcl.StdCtrls, Vcl.WinXCtrls, Vcl.ExtCtrls ,cxButtons ;

type
  TFrmCredits = class(TForm)
    cxGrid1: TcxGrid;
    cxGrid1DBTableView3: TcxGridDBTableView;
    cxGrid1DBTableView3Num: TcxGridDBColumn;
     cxGrid1DBTableView3Price : TcxGridDBColumn; 

    RootGroup: TcxGridInplaceEditFormGroup;
    cxGrid1Level1: TcxGridLevel;
    DataSource1: TDataSource;
    PanWinTitle: TPanel;	
	PanBottom: TPanel;
	LbWinTitle: TLabel;
    BtnAdd: TcxButton;
    BtnEdit: TcxButton;
    BtnDelete: TcxButton;
	BtnClose: TcxButton;
    SearchBox1: TSearchBox;
    Credits: TFDMemTable;
    CreditsNum: TstringField;
    CreditsID:TStringField;
CreditsClient_id:TStringField;
CreditsPrice:TFloatField;

    procedure BtnAddClick(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure SearchBox1Change(Sender: TObject);
    procedure BtnEditClick(Sender: TObject);
    procedure BtnDeleteClick(Sender: TObject);
	procedure BtnCloseClick(Sender: TObject);
    procedure FormCreate(Sender: TObject);
	procedure CreditsCalcFields(DataSet: TDataSet);
  private
    { Private declarations }
  public
    procedure LoadData;
  end;

var
  FrmCredits: TFrmCredits;

implementation

{$R *.dfm}
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

uses  Consts, DmUnit, DetailCreditUnit , ControllerCredit ;

procedure TFrmCredits.CreditsCalcFields(DataSet: TDataSet);
begin
  if DataSet.RecNo > 0 then
    DataSet['num'] := DataSet.RecNo
  else
    DataSet['num'] := 1;
end;

procedure TFrmCredits.BtnAddClick(Sender: TObject);
begin
  if DM.GetAuth('add_Credits') then
    with TFrmDetailCredit.Create(Self) do
      try
        if ShowModal = mrOk then
          LoadData;
      finally
        Free;
      end;
end;

procedure TFrmCredits.BtnEditClick(Sender: TObject);
begin
  if DM.GetAuth('edit_Credits') then
    if Credits.RecordCount > 0 then
      with TFrmDetailCredit.Create(Self) do
        try
          ID := Credits['ID'] ;
          if ShowModal = mrOk then
            LoadData;
        finally
          Free;
        end;
end;

procedure TFrmCredits.BtnDeleteClick(Sender: TObject);
begin
  if Credits.RecordCount > 0 then
    if DM.GetAuth('delete_Credits') then
      with TCredit.Create(Credits['ID']) do
        try
          if MessageDlg(DLG_CONFIRME_DELETE, mtConfirmation, [mbYes, mbNo], 0) = mrYes
          then
            if delete then
              LoadData;
        finally
          Free;
        end;
end;
procedure TFrmCredits.BtnCloseClick(Sender: TObject);
begin
	Close;
end;
procedure TFrmCredits.LoadData;
var
  Sql, ID : string;
begin
  ID := '';
  Sql := Format(SQL_LOAD_Credits, [QuotedStr('%' + ID + '%')]);
  DM.DBCtrl.LoadTable(Sql, Credits);
end;

procedure TFrmCredits.FormCreate(Sender: TObject);
begin

end;

procedure TFrmCredits.FormShow(Sender: TObject);
begin
  LoadData;
end;

procedure TFrmCredits.SearchBox1Change(Sender: TObject);
begin
  LoadData;
end;

end.

