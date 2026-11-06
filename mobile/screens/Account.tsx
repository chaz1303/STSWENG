// Account sheets shared by Home, the booking screens and the Account tab.
import { Image, Switch, View } from 'react-native';
import { setAlerts, setPayment, setVoucher } from '../services/account';
import { C, R, peso } from '../theme';
import { Btn, Grey, Icon, IMG, Kv, Opt, Sheet, SheetTitle, T } from '../ui';
import type { App, PastBooking } from '../types';

export const GcashMark = ({ size = 22 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 4,
      backgroundColor: C.gcash,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <T w={800} style={{ color: C.white, fontSize: size * 0.5 }}>
      G
    </T>
  </View>
);

export function AddressSheet({ app, open, close }: { app: App; open: boolean; close: () => void }) {
  return (
    <Sheet open={open} onClose={close}>
      <SheetTitle title="Service address" sub="Where should Manong go?" />
      {app.state.addresses.map((a, i) => (
        <Opt
          key={i}
          title={a.title}
          sub={a.detail}
          on={app.state.addressIdx === i}
          icon={<Icon name="home" size={20} color={C.ink} />}
          onPress={() => {
            app.update({ addressIdx: i });
            close();
          }}
        />
      ))}
      {/* TODO(backend): adding addresses needs the addresses endpoint. */}
      <Opt
        title="Add new address"
        icon={<Icon name="plus" size={20} color={C.ink} />}
        onPress={() => app.toast("Adding addresses isn't available yet")}
      />
    </Sheet>
  );
}

export function PaySheet({ app, open, close }: { app: App; open: boolean; close: () => void }) {
  const pick = async (method: 'gcash' | 'cash') => {
    app.update({ payment: await setPayment(method) });
    close();
  };
  return (
    <Sheet open={open} onClose={close}>
      <SheetTitle title="Payment method" sub="You're only charged after Manong finishes." />
      <Opt
        title="GCash"
        sub="Held in escrow until the job is done"
        on={app.state.payment === 'gcash'}
        icon={<GcashMark />}
        onPress={() => pick('gcash')}
      />
      <Opt
        title="Cash"
        sub="Pay Manong directly"
        on={app.state.payment === 'cash'}
        icon={<Icon name="dollar-sign" size={20} color={C.ink} />}
        onPress={() => pick('cash')}
      />
    </Sheet>
  );
}

export function VoucherSheet({ app, open, close }: { app: App; open: boolean; close: () => void }) {
  const pick = async (on: boolean) => {
    app.update({ voucher: await setVoucher(on) });
    close();
    app.toast(on ? 'MANONG50 applied, ₱50 off' : 'Voucher removed');
  };
  return (
    <Sheet open={open} onClose={close}>
      <SheetTitle title="Vouchers" />
      <Opt
        title="MANONG50"
        sub="₱50 off any service · until Oct 31"
        on={app.state.voucher}
        icon={<Icon name="tag" size={20} color={C.ink} />}
        onPress={() => pick(true)}
      />
      <Opt
        title="No voucher"
        on={!app.state.voucher}
        icon={<Icon name="x" size={20} color={C.ink} />}
        onPress={() => pick(false)}
      />
    </Sheet>
  );
}

export function AlertsSheet({ app, open, close }: { app: App; open: boolean; close: () => void }) {
  const flip = async (k: 'bookings' | 'promos') =>
    app.update({ alerts: await setAlerts({ ...app.state.alerts, [k]: !app.state.alerts[k] }) });
  const row = (k: 'bookings' | 'promos', title: string, sub: string) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1.5,
        borderColor: C.line,
        borderRadius: R.card,
        padding: 14,
      }}
    >
      <View style={{ flex: 1 }}>
        <T w={700}>{title}</T>
        <T style={{ fontSize: 13, color: C.slate }}>{sub}</T>
      </View>
      <Switch
        accessibilityLabel={title}
        value={app.state.alerts[k]}
        onValueChange={() => flip(k)}
        trackColor={{ true: C.mango, false: C.grey }}
        thumbColor={C.white}
      />
    </View>
  );
  return (
    <Sheet open={open} onClose={close}>
      <SheetTitle title="Notifications" sub="Choose what we send you." />
      {row('bookings', 'Booking updates', 'Accepted, on the way, completed')}
      {row('promos', 'Promos and vouchers', 'Occasional offers')}
      <Btn label="Done" onPress={close} />
    </Sheet>
  );
}

export function ReceiptSheet({
  app,
  past,
  close,
}: {
  app: App;
  past: PastBooking | null;
  close: () => void;
}) {
  const p = past;
  const cat = p && app.state.catalog[p.category];
  return (
    <Sheet open={!!p} onClose={close}>
      {p && cat && (
        <>
          <SheetTitle
            title={`${cat.name}, ${cat.tiers[p.serviceType].name.toLowerCase()}`}
            sub={`${p.id} • ${p.date} • ${p.manong.name}`}
          />
          <Grey>
            <Kv
              rows={[
                ['Base price', peso(cat.tiers[p.serviceType].price)],
                ['Paid', peso(p.total)],
                ['Payment', p.payment === 'gcash' ? 'GCash' : 'Cash'],
              ]}
            />
          </Grey>
          <Btn
            label={`Book ${p.manong.first} again`}
            onPress={() => {
              close();
              app.startBooking(p.category, { manongKey: p.manong.key, serviceType: p.serviceType });
              app.toast(`Requesting ${p.manong.first} again`);
            }}
          />
          <Btn kind="grey" label="Close" onPress={close} />
        </>
      )}
    </Sheet>
  );
}

export function JobSheet({
  job,
  close,
}: {
  job: { photo: 'pipe' | 'job2'; title: string; detail: string } | null;
  close: () => void;
}) {
  return (
    <Sheet open={!!job} onClose={close}>
      {job && (
        <>
          <Image
            source={IMG[job.photo]}
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 14 }}
            resizeMode="cover"
            accessibilityLabel={job.title}
          />
          <SheetTitle title={job.title} sub={job.detail} />
          <Btn label="Close" onPress={close} />
        </>
      )}
    </Sheet>
  );
}
