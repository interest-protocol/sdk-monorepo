import invariant from 'tiny-invariant';

import { TickMath } from '@/math';
import { NearestUsableTickArgs } from '@/types';

export const nearestUsableTick = ({
  tick,
  tickSpacing,
}: NearestUsableTickArgs) => {
  invariant(
    Number.isInteger(tick) && Number.isInteger(tickSpacing),
    'nearestUsableTick: INTEGERS'
  );
  invariant(tickSpacing > 0, 'nearestUsableTick: TICK_SPACING');
  invariant(
    tick >= TickMath.MIN_TICK && tick <= TickMath.MAX_TICK,
    'nearestUsableTick: tick must be between MIN_TICK and MAX_TICK'
  );

  const rounded = Math.round(tick / tickSpacing) * tickSpacing;
  if (rounded < TickMath.MIN_TICK) return rounded + tickSpacing;
  else if (rounded > TickMath.MAX_TICK) return rounded - tickSpacing;
  else return rounded;
};
