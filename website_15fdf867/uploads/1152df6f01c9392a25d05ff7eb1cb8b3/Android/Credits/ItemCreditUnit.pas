
unit ItemCreditUnit;

interface

uses
  System.SysUtils, System.Types, System.UITypes, System.Classes,
  System.Variants,
  FMX.Types, FMX.Graphics, FMX.Controls, FMX.Forms, FMX.Dialogs, FMX.StdCtrls,
  FMX.Objects, FMX.Controls.Presentation, FMX.Layouts;

type
  TItemCredit = class(TFrame)
    LayClient_id: TLayout;
LayPrice: TLayout;

    LbClient_id: TLabel;
LbPrice: TLabel;

    RectPlatForm: TRectangle;
    RecEdit: TRectangle;
    RecDelete: TRectangle;
    LayEdit: TLayout;
    LayDelete: TLayout;
    procedure RecDeleteClick(Sender: TObject);
    procedure RecEditClick(Sender: TObject);
  private
    { Private declarations }
    FID: string;
    FIsSelected: Boolean;
    procedure SetIsSelected(const Value: Boolean);
    procedure DeleteCredit;
    procedure EditCredit;
    { Private declarations }
  public
    constructor Create(AOwner: TComponent); override;
    Destructor Destroy; override;
    property IsSelected: Boolean read FIsSelected write SetIsSelected;
    property ID: string read FID write FID;

  var
    LoadData: Procedure of object;
    ShowDetail: Procedure(aID: string) of object;
  end;

implementation

{$R *.fmx}
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

uses ControllerCredit, Consts, CreditsUnit, DMUnit;
{ TItemCredit }

constructor TItemCredit.Create(AOwner: TComponent);
begin
  inherited;  
end;

procedure TItemCredit.DeleteCredit;
var
  IsDeleted: Boolean;
begin

  with TCredit.Create(ID) do
    try
      IsDeleted := Delete;
    finally
      Free;
    end;
  if IsDeleted then
    DM.GS.ProcThrd(LoadData);
end;

destructor TItemCredit.Destroy;
begin
  inherited;
end;

procedure TItemCredit.EditCredit;
begin
  ShowDetail(FID);
end;

procedure TItemCredit.RecDeleteClick(Sender: TObject);
begin
  DeleteCredit;
end;

procedure TItemCredit.RecEditClick(Sender: TObject);
begin
  EditCredit;
end;

procedure TItemCredit.SetIsSelected(const Value: Boolean);
begin
  FIsSelected := Value;
  if FIsSelected then
  begin
    RectPlatForm.Fill.Color := $FFA4B197;
  end
  else
  begin
    RectPlatForm.Fill.Color := FrmCredits.aColor_Item; // Color_Item;
  end;

end;

end.

