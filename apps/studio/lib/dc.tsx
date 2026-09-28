"use client";

// Minimal runtime for the Zebraish pages ported from Claude Design prototypes.
// Each prototype is a logic class (state + renderVals) plus a template; this
// mirrors the prototype runtime's semantics so the ported pages render and
// behave exactly as designed.
import React, { Fragment, isValidElement } from "react";
import { subscribeZbLang, translateTree } from "@/lib/zebraish/i18n";

type Vals = Record<string, unknown>;
type Props = Record<string, unknown>;

export class DCLogic {
  props: Props;
  state: Record<string, unknown> = {};
  __host: Host | null = null;
  constructor(props: Props) {
    this.props = props || {};
  }
  setState(update: Record<string, unknown> | ((s: Record<string, unknown>) => Record<string, unknown>), cb?: () => void) {
    this.__host?.__setLogicState(update, cb);
  }
  forceUpdate() {
    this.__host?.forceUpdate();
  }
  componentDidMount() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidUpdate(_prevProps: Props, _prevState: Record<string, unknown>) {}
  componentWillUnmount() {}
  renderVals(): Vals {
    return {};
  }
}

type LogicClass = new (props: Props) => DCLogic;
type Host = React.Component<Props, { v: number }> & {
  __setLogicState: DCLogic["setState"];
};

/** Interpolated template text: primitives render inside a span, as in the prototype runtime. */
export function I(x: unknown): React.ReactNode {
  if (x === undefined || x === null || typeof x === "boolean") return null;
  if (isValidElement(x) || Array.isArray(x)) return x as React.ReactNode;
  return <span className="sc-interp">{String(x)}</span>;
}

/** `sc-for`: renders `fn` once per item with the item bound under `as` and `$index`. */
export function each(v: Vals, list: unknown, as: string, fn: (v: Vals) => React.ReactNode) {
  if (!Array.isArray(list)) return null;
  return list.map((item, i) => <Fragment key={i}>{fn({ ...v, [as]: item, $index: i })}</Fragment>);
}

/** Inline CSS text to a React style object. */
export function css(text: unknown): React.CSSProperties | undefined {
  if (typeof text !== "string") return (text as React.CSSProperties) ?? undefined;
  const o: Record<string, string> = {};
  for (const decl of text.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decl.slice(i + 1).trim();
  }
  return o as React.CSSProperties;
}

const HOST_STYLE_PROPS = new Set(["position", "left", "right", "top", "bottom", "inset", "width", "height", "zIndex", "transform"]);

/** A `style` on an imported component positions its host box only. */
export function hostPositionStyle(style: unknown) {
  const all = typeof style === "string" ? css(style) : (style as Record<string, unknown> | undefined);
  if (!all) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(all)) if (HOST_STYLE_PROPS.has(k)) out[k] = v;
  return Object.keys(out).length ? (out as React.CSSProperties) : undefined;
}

export function dcComponent(name: string, Logic: LogicClass, template: (v: Vals) => React.ReactNode, defaults: Props = {}) {
  class DC extends React.Component<Props, { v: number }> {
    static displayName = name.replace(/\s/g, "");
    logic: DCLogic;
    prevLogicState: Record<string, unknown>;
    constructor(props: Props) {
      super(props);
      this.state = { v: 0 };
      this.logic = new Logic(this.userProps());
      this.logic.__host = this as unknown as Host;
      this.prevLogicState = this.logic.state;
    }
    userProps(): Props {
      const { __hostStyle, ...rest } = this.props;
      void __hostStyle;
      const out: Props = { ...defaults };
      for (const [k, v] of Object.entries(rest)) if (v !== undefined) out[k] = v;
      return out;
    }
    __setLogicState: DCLogic["setState"] = (update, cb) => {
      const prev = this.logic.state;
      const patch = typeof update === "function" ? update(prev) : update;
      this.logic.state = { ...prev, ...patch };
      this.setState((s) => ({ v: s.v + 1 }), cb);
    };
    unsubLang: (() => void) | null = null;
    componentDidMount() {
      this.unsubLang = subscribeZbLang(() => this.forceUpdate());
      try {
        this.logic.componentDidMount();
      } catch (e) {
        console.error(e);
      }
      this.prevLogicState = this.logic.state;
    }
    componentDidUpdate(prevProps: Props) {
      this.logic.props = this.userProps();
      const prevState = this.prevLogicState;
      this.prevLogicState = this.logic.state;
      try {
        this.logic.componentDidUpdate(prevProps, prevState);
      } catch (e) {
        console.error(e);
      }
    }
    componentWillUnmount() {
      this.unsubLang?.();
      try {
        this.logic.componentWillUnmount();
      } catch (e) {
        console.error(e);
      }
    }
    render() {
      const props = this.userProps();
      this.logic.props = props;
      let vals: Vals = props;
      try {
        vals = { ...props, ...(this.logic.renderVals() || {}) };
      } catch (e) {
        console.error(e);
      }
      return (
        <div className="sc-host" data-sc-name={name} style={this.props.__hostStyle as React.CSSProperties | undefined}>
          {translateTree(template(vals))}
        </div>
      );
    }
  }
  return DC;
}
