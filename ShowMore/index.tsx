/* eslint-disable react/no-find-dom-node */
/*
 ShowMore 组件支持内容为 元素数组或者长字符串的元素
 可通过css实现内容展示隐藏的样式
 可通过js实现切换内容展示隐藏的交互
 如为元素数组，则要求为 长度 宽度统一的 块级元素，需要指定宽度。
*/
import React from 'react';
import ReactDom from 'react-dom';
import { debounce } from '../../Util';
interface ShowMoreProp {
    children: any;
    lines: number;
    more: string;
    less: string;
    childMarginTop: number;
    childMarginBottom: number;
    warpperClassName: string;
    contaninerClassName: string;
}
export default class ShowMore extends React.Component<ShowMoreProp, any> {
    firstChildRef: any = null;
    containerRef: any = null;
    data: any = null;
    state = {
        active: 1,
    };

    componentDidMount() {
        window.addEventListener(
            'resize',
            debounce(() => {
                this.forceUpdate();
            }, 1000)
        );
    }

    toggleActive() {
        this.setState({
            active: this.state.active ? 0 : 1,
        });
    }
    renderContent() {
        return this.props.children instanceof Array ? this.renderElementArr() : this.renderLongText();
    }
    renderLongText() {
        const { children } = this.props;
        if (typeof children !== 'string') {
            console.error('Warning: [ShowMore] expect that children is kind of `longText` or `element[]`');
            return null;
        }
        return '';
    }
    renderElementArr() {
        const {
            children,
            warpperClassName,
            contaninerClassName,
            lines,
            childMarginTop,
            childMarginBottom,
            more,
            less,
        } = this.props;
        const { active } = this.state;

        if (
            !(
                children[0] &&
                children[0].$$typeof &&
                children[0].$$typeof &&
                typeof children[0].$$typeof === 'symbol' &&
                children[0].$$typeof.description === 'react.element'
            )
        ) {
            console.error('Warning: [ShowMore] expect that children is kind of `longText` or `element[]`');
            return null;
        }
        const firstChildNode = ReactDom.findDOMNode(this.firstChildRef);
        const firstChildHeight = (firstChildNode && (firstChildNode as any).offsetHeight) || 0;
        const firstChildWidth = (firstChildNode && (firstChildNode as any).offsetWidth) || 0;
        const containerMaxHeight = (firstChildHeight + childMarginTop + childMarginBottom) * lines || 0;
        const containerNode = ReactDom.findDOMNode(this.containerRef);
        const containerWidth = (containerNode && (containerNode as any).offsetWidth) || 0;
        const maxCount = Math.floor(containerWidth / firstChildWidth) * lines;
        const show = maxCount < children.length;
        this.data = {
            child: {
                height: firstChildHeight,
                width: firstChildWidth,
            },
            containerMaxHeight,
            maxCount,
        };
        return (
            <div className={warpperClassName}>
                <div
                    className={contaninerClassName}
                    style={{ maxHeight: active === 1 ? containerMaxHeight : 'unset', overflowY: 'hidden' }}
                    ref={(r) => (this.containerRef = r)}>
                    {React.Children.map(children, (child, i) => {
                        if (i === 0) {
                            if (child.type && child.type.displayName === 'Popconfirm') {
                                return React.cloneElement(child, {
                                    children: React.cloneElement(child.props.children, {
                                        ref: (r: any) => (this.firstChildRef = r),
                                    }),
                                });
                            } else {
                                return React.cloneElement(child, {
                                    ref: (r: any) => (this.firstChildRef = r),
                                });
                            }
                        }
                        return React.cloneElement(child, {});
                    })}
                </div>
                {show ? (
                    <div className="groupnotice-titletagitems-showall">
                        <a onClick={this.toggleActive.bind(this)}>
                            {active ? more : less}
                            <i className="groupnotice-titletagitems-showallicon"></i>
                        </a>
                    </div>
                ) : null}
            </div>
        );
    }
    render() {
        return this.renderContent();
    }
}

/*
<ShowMore
                                        lines={4}
                                        more="Show more"
                                        less="Show less"
                                        childMarginTop={6}
                                        childMarginBottom={6}
                                        warpperClassName="groupnotice-tagitemswarpper"
                                        contaninerClassName="groupnotice-titletagitems">
                                        {Array.from(new Array(100).keys()).map((key: any) => (
                                            <Popconfirm
                                                key={key}
                                                title={
                                                    <span className="main-popconfirm-title">
                                                        Confirm to remove this order from the send list？
                                                    </span>
                                                }
                                                okText="Comfirm"
                                                cancelText="Cancel"
                                                placement="topRight"
                                                overlayClassName="groupnotice-main-popconfirm">
                                                <Tag
                                                    closable
                                                    className="main-tagV1"
                                                    style={{ display: 'inline-block', width: 100 }}>
                                                    {key}
                                                </Tag>
                                            </Popconfirm>
                                        ))}
                                    </ShowMore>
*/
